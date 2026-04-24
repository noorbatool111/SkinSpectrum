from fastapi import FastAPI, UploadFile, File
import uvicorn
import numpy as np
import cv2
from keras.models import load_model
import mediapipe as mp

app = FastAPI()

# Load model (optional)
model = load_model("skin_model.h5", compile=False)

# MediaPipe setup
mp_face_mesh = mp.solutions.face_mesh


# -------------------------
# PREPROCESS
# -------------------------
def preprocess(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    h, w, _ = img.shape
    img_crop = img[int(h*0.2):int(h*0.9), int(w*0.2):int(w*0.8)]

    img_resized = cv2.resize(img_crop, (224, 224))
    img_resized = img_resized / 255.0
    img_resized = np.expand_dims(img_resized, axis=0)

    return img_resized, img_crop


# -------------------------
# WRINKLES
# -------------------------
def detect_wrinkles(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    texture = np.abs(laplacian)

    wrinkle_score = np.mean(texture)
    print("Wrinkle texture score:", wrinkle_score)

    if wrinkle_score < 5:
        return 2
    elif wrinkle_score < 10:
        return 4
    elif wrinkle_score < 20:
        return 6
    elif wrinkle_score < 35:
        return 8
    else:
        return 10


# -------------------------
# ACNE
# -------------------------
def detect_acne(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5,5), 0)

    diff = cv2.absdiff(gray, blurred)
    _, thresh = cv2.threshold(diff, 8, 255, cv2.THRESH_BINARY)

    kernel = np.ones((3,3), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    small_spots = 0
    large_areas = 0

    for cnt in contours:
        area = cv2.contourArea(cnt)

        if 10 < area < 300:
            small_spots += 1
        elif area >= 300:
            large_areas += 1

    print("Small spots:", small_spots, "Large areas:", large_areas)

    score = small_spots + (large_areas * 5)

    if score < 3:
        return 1
    elif score < 10:
        return 3
    elif score < 25:
        return 5
    elif score < 50:
        return 7
    else:
        return 9


# -------------------------
# FACE SHAPE (MediaPipe)
# -------------------------
def detect_face_shape(img):
    with mp_face_mesh.FaceMesh(static_image_mode=True) as face_mesh:
        results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

        if not results.multi_face_landmarks:
            return "Unknown"

        landmarks = results.multi_face_landmarks[0].landmark

        forehead = landmarks[10].y
        chin = landmarks[152].y
        left = landmarks[234].x
        right = landmarks[454].x

        face_height = chin - forehead
        face_width = right - left

        ratio = face_height / face_width

        if ratio > 1.5:
            return "Oval"
        elif ratio > 1.3:
            return "Round"
        else:
            return "Square"


# -------------------------
# SKIN TYPE
# -------------------------
def detect_skin_type(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray)

    print("Skin brightness:", brightness)

    if brightness < 80:
        return "Dry"
    elif brightness < 140:
        return "Normal"
    else:
        return "Oily"


# -------------------------
# API
# -------------------------
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    image_bytes = await file.read()

    img_tensor, img_crop = preprocess(image_bytes)

    pred = model.predict(img_tensor)[0]
    print("Raw model prediction:", pred)

    wrinkles_score = detect_wrinkles(img_crop)
    acne_score = detect_acne(img_crop)
    face_shape = detect_face_shape(img_crop)
    skin_type = detect_skin_type(img_crop)

    result = {
        "acne": acne_score,
        "wrinkles": wrinkles_score,
        "face_shape": face_shape,
        "skin_type": skin_type
    }

    return result


# -------------------------
# RUN SERVER
# -------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)