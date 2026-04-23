from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
import os
import math
from typing import List
import mediapipe as mp
from PIL import Image
import io

# Initialize FastAPI app
app = FastAPI(title="SkinSpectrum AI Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Mediapipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True, 
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

# Initialize Skin Classification Model (Hugging Face)
# This uses a pre-trained model for skin disease classification
try:
    from transformers import pipeline
    print("Loading Skin Analysis Model (this may take a minute on first run)...")
    skin_classifier = pipeline("image-classification", model="denis-isik/skin-disease-classification")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Warning: Could not load skin classifier: {e}")
    skin_classifier = None

def calculate_distance(p1, p2):
    """Calculate Euclidean distance between two landmarks."""
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

def detect_face_shape(landmarks):
    """
    Detect face shape based on facial landmark ratios.
    Ratios are calculated using heights and widths at key points.
    """
    # Key Landmarks:
    # Top: 10, Bottom: 152
    # Left Forehead: 103, Right Forehead: 332
    # Left Cheek: 234, Right Cheek: 454
    # Left Jaw: 58, Right Jaw: 288

    face_height = calculate_distance(landmarks[10], landmarks[152])
    forehead_width = calculate_distance(landmarks[103], landmarks[332])
    cheekbone_width = calculate_distance(landmarks[234], landmarks[454])
    jaw_width = calculate_distance(landmarks[58], landmarks[288])
    
    # Ratio of Height to Cheekbone Width
    ratio_hw = face_height / cheekbone_width
    
    if ratio_hw > 1.5:
        return "Oblong"
    elif 1.25 < ratio_hw <= 1.5:
        if forehead_width > cheekbone_width * 0.9 and cheekbone_width > jaw_width * 1.1:
            return "Heart"
        else:
            return "Oval"
    elif 1.0 <= ratio_hw <= 1.25:
        if jaw_width >= cheekbone_width * 0.85:
            return "Square"
        else:
            return "Round"
    else:
        return "Diamond"

def get_recommendations(conditions):
    """Generate smart recommendations based on detected conditions."""
    recommendations = []
    
    condition_names = [c['name'].lower() for c in conditions]
    
    if any(x in str(condition_names) for x in ['acne', 'pimples']):
        recommendations.append("Use a gentle cleanser with Salicylic Acid or Benzoyl Peroxide.")
        recommendations.append("Avoid touching or picking at your skin to prevent scarring.")
    
    if any(x in str(condition_names) for x in ['eczema', 'dermatitis', 'dry']):
        recommendations.append("Focus on intensive hydration with ceramides and hyaluronic acid.")
        recommendations.append("Avoid hot water and harsh soaps that strip natural oils.")
        
    if any(x in str(condition_names) for x in ['nevus', 'mole', 'pigmentation']):
        recommendations.append("Monitor any changes in mole size or color; consult a dermatologist if concerned.")
        recommendations.append("Apply broad-spectrum SPF 50 daily to prevent further pigmentation.")

    if not recommendations:
        recommendations = [
            "Maintain a consistent double-cleansing routine.",
            "Stay hydrated by drinking at least 2-3 liters of water daily.",
            "Always wear sunscreen, even on cloudy days.",
            "Include antioxidants like Vitamin C in your morning routine."
        ]
        
    return recommendations[:4]

@app.get("/")
async def root():
    return {"message": "SkinSpectrum AI Analysis API is active and loaded."}

@app.post("/analyze-skin")
async def analyze_skin(file: UploadFile = File(...)):
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Convert to RGB for Mediapipe and PIL
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # 1. Face Detection & Shape Analysis
        results = face_mesh.process(img_rgb)
        
        if not results.multi_face_landmarks:
            return {
                "success": False,
                "message": "No face detected. Please ensure your face is clearly visible and well-lit."
            }

        landmarks = results.multi_face_landmarks[0].landmark
        face_shape = detect_face_shape(landmarks)

        # 2. Skin Condition Analysis (Actual ML Model)
        pil_img = Image.fromarray(img_rgb)
        conditions = []
        
        if skin_classifier:
            # Run the model
            predictions = skin_classifier(pil_img)
            
            # Convert model outputs to our app's format
            for pred in predictions:
                # Label cleanup
                name = pred['label'].replace('_', ' ').capitalize()
                # Score to 1-10 scale
                severity = round(pred['score'] * 10, 1)
                
                if severity >= 1.0: # Only include significant detections
                    conditions.append({
                        "name": name,
                        "severity": severity,
                        "level": "High" if severity > 7 else "Medium" if severity > 4 else "Low"
                    })
        
        # Fallback if no conditions detected or model failed
        if not conditions:
            conditions = [
                {"name": "Clear Skin", "severity": 1.0, "level": "Optimal"}
            ]

        # 3. Determine Skin Type (Texture Analysis approximation)
        # In a real app, this would use a specific classifier. 
        # Here we use a refined placeholder based on brightness/contrast as a proxy.
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        std_dev = np.std(gray)
        
        if brightness > 180:
            skin_type = "Oily (High Shine)"
        elif brightness < 80:
            skin_type = "Dry (Low Reflectivity)"
        elif std_dev > 50:
            skin_type = "Combination"
        else:
            skin_type = "Normal"

        # 4. Generate Results
        analysis_results = {
            "face_shape": face_shape,
            "skin_type": skin_type,
            "conditions": conditions[:4],
            "recommendations": get_recommendations(conditions),
            "weather_advice": {
                "uv_index": 4, # This would ideally come from a Weather API based on user location
                "advice": "Moderate UV levels. Apply SPF 30+ sunscreen if going outdoors."
            }
        }

        return {
            "success": True,
            "data": analysis_results
        }

    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
