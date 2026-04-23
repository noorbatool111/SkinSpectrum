---
name: react-native-fullstack
description: "Build a full-stack mobile app using React Native frontend and FastAPI/Node.js backend"
---

# Full-Stack React Native Mobile App Development

This skill guides the complete workflow for building a production-ready mobile app with React Native frontend and Python/Node backend.

## Prerequisites

- Node.js & npm (frontend)
- Python 3.8+ (backend)
- Virtual environment manager (venv)
- Expo CLI or React Native CLI

## 1. Project Setup

### 1.1 Initialize Backend (Python/FastAPI)

```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 1.2 Initialize Frontend (React Native)

```bash
npm install
# or if using Expo
expo install
```

## 2. Backend Architecture

### Structure

```
server/
├── server.js (or main.py for FastAPI)
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   └── Analysis.js (for storing analysis results)
├── routes/
│   ├── auth.js
│   └── analysis.js (ML/image analysis endpoints)
├── ml/
│   ├── model.py (load pre-trained model)
│   ├── image_processor.py (preprocessing)
│   └── predictor.py (inference logic)
├── requirements.txt
└── .env
```

### Key Patterns

- **Authentication**: Implement JWT tokens in middleware
- **Database**: Store user profiles, analysis history, ML predictions
- **API Routes**: RESTful endpoints for authentication & image analysis
- **ML Pipeline**: Image processing → Model inference → Result storage
- **Error Handling**: Consistent error response format with validation

## 3. Frontend Architecture

### Structure

```
src/
├── screens/         # Full-page components
├── components/      # Reusable UI components
├── navigation/      # Navigation setup (Stack, Tab, Drawer)
├── context/         # Global state (UserContext, ThemeContext)
├── services/        # API calls (api.js)
└── assets/          # Images, fonts, static files
```

### Key Patterns

- **Navigation**: Use React Navigation for Stack/Tab/Drawer
- **State Management**: Use Context API for global state
- **API Service**: Centralized API calls in `services/api.js`
- **Authentication**: Store JWT tokens in AsyncStorage/SecureStore

## 4. Authentication Flow

### Backend

1. User signup/login endpoint validates credentials
2. Generate JWT token with user ID
3. Return token to frontend

### Frontend

1. Store JWT in SecureStore (sensitive data)
2. Add token to Authorization header for all API requests
3. Implement logout by clearing stored token
4. Refresh token on expiry

**Implementation**:

```javascript
// services/api.js
const api = axios.create({
  baseURL: "http://your-backend-url",
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 4.5 ML/AI Model Integration

### Backend ML Setup

#### 1. Load Pre-trained Model

```python
# ml/model.py
import tensorflow as tf
import torch
from PIL import Image
import numpy as np

class SkinAnalysisModel:
    def __init__(self, model_path):
        # For TensorFlow models
        self.model = tf.keras.models.load_model(model_path)
        # Or for PyTorch models
        # self.model = torch.load(model_path)

    def predict(self, image_array):
        # Preprocessing handled in predictor
        predictions = self.model.predict(image_array)
        return predictions
```

#### 2. Image Processing Pipeline

```python
# ml/image_processor.py
import cv2
import mediapipe as mp
from PIL import Image
import numpy as np

class ImageProcessor:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection

    def preprocess(self, image_path):
        """
        1. Load image
        2. Detect facial regions
        3. Extract relevant areas
        4. Normalize pixel values
        5. Resize to model input size
        """
        img = cv2.imread(image_path)
        # Resize, normalize, etc.
        return processed_image

    def extract_features(self, image):
        """Extract facial landmarks, skin texture, etc."""
        pass
```

#### 3. API Endpoint for Image Analysis

```python
# FastAPI endpoint
from fastapi import File, UploadFile
import aiofiles

@app.post("/analyze/skin")
async def analyze_skin(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    """
    1. Receive image from frontend
    2. Validate file (size, format)
    3. Preprocess image
    4. Run ML inference
    5. Store results in database
    6. Return analysis to frontend
    """
    # Save uploaded file
    file_path = f"uploads/{current_user}/{file.filename}"
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(await file.read())

    # Preprocess
    processed = image_processor.preprocess(file_path)

    # Predict
    predictions = ml_model.predict(processed)

    # Store in database
    analysis = Analysis.create(
        user_id=current_user,
        image_path=file_path,
        results=predictions,
        created_at=datetime.now()
    )

    return {
        "analysis_id": analysis.id,
        "skin_type": predictions['skin_type'],
        "conditions": predictions['conditions'],
        "recommendations": predictions['recommendations']
    }
```

### Frontend Image Capture & Upload

#### 1. Capture Image from Camera

```javascript
// screens/CameraScreen.js
import { Camera } from "expo-camera";

export function CameraScreen({ navigation }) {
  const cameraRef = useRef(null);

  const takePicture = async () => {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });
    // Send to backend
    uploadImage(photo.uri);
  };

  return (
    <Camera ref={cameraRef} style={{ flex: 1 }}>
      <TouchableOpacity onPress={takePicture}>
        <Text>Capture</Text>
      </TouchableOpacity>
    </Camera>
  );
}
```

#### 2. Upload Image to Backend

```javascript
// services/api.js
export const analyzeImage = async (imageUri) => {
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "skin_analysis.jpg",
  });

  try {
    const response = await api.post("/analyze/skin", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Analysis failed: " + error.message);
  }
};
```

#### 3. Display Analysis Results

```javascript
// screens/AnalysisResultScreen.js
export function AnalysisResultScreen({ route }) {
  const { results } = route.params;

  return (
    <ScrollView>
      <Image source={{ uri: results.image_url }} />
      <Text>Skin Type: {results.skin_type}</Text>
      <FlatList
        data={results.conditions}
        renderItem={({ item }) => (
          <Text>
            {item.name}: {item.severity}
          </Text>
        )}
      />
      <Text>Recommendations: {results.recommendations.join(", ")}</Text>
    </ScrollView>
  );
}
```

### ML Considerations

**Model Format**:

- Use TensorFlow/Keras (.h5, .pb) for simplicity
- Consider TensorFlow Lite (.tflite) for mobile deployment later
- PyTorch models (.pt) for flexibility

**Performance**:

- Inference should take <2 seconds
- Consider edge ML (on-device) vs cloud inference
- Cache model in memory after loading

**Data Storage**:

- Store image in cloud (S3/GCS) not in database
- Store only analysis results in database
- Implement image cleanup (delete after 90 days)

**Training Workflow** (for updating models):

- Collect user analysis data (with consent)
- Anonymize images
- Retrain model on new data
- Version control models (model_v1.h5, model_v2.h5)
- Update backend endpoint to use new model version

## 5. Data Flow

### User Registration

1. Frontend: User enters data (name, email, password, preferences)
2. Frontend: Validate input client-side
3. Frontend: POST to `/auth/signup`
4. Backend: Validate, hash password, create user in database
5. Backend: Return JWT token
6. Frontend: Store token, navigate to home screen

### User Data Retrieval

1. Frontend: GET `/user/profile` (with token)
2. Backend: Extract user ID from token, query database
3. Backend: Return user data
4. Frontend: Store in Context, display on ProfileScreen

### Skin Analysis Flow (ML)

1. **Frontend**: User navigates to CameraScreen
2. **Frontend**: Capture image using device camera
3. **Frontend**: Upload image to `/analyze/skin` endpoint
4. **Backend**: Receive image, validate file (size, format, MIME type)
5. **Backend**: Save image temporarily to disk
6. **Backend**: Preprocess image (resize, normalize, facial detection)
7. **Backend**: Run ML model inference
8. **Backend**: Extract predictions (skin type, conditions, severity)
9. **Backend**: Store analysis results in database
10. **Backend**: Return analysis results to frontend
11. **Frontend**: Display results on AnalysisResultScreen
12. **Frontend**: Allow user to save/share results

## 6. Screen Implementation Checklist

For each screen:

- [ ] Define navigation params (if needed)
- [ ] Set up local state (useState)
- [ ] Pull global state from Context
- [ ] Add API calls (useEffect)
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Create UI components
- [ ] Test navigation flow

## 7. Common Integration Points

### Setup API Service

```javascript
// services/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const auth = {
  signup: (data) => api.post("/auth/signup", data),
  login: (email, password) => api.post("/auth/login", { email, password }),
  profile: () => api.get("/user/profile"),
};
```

### Create Context for Global State

```javascript
// context/UserContext.js
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user from token on app start
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}
```

### Protect Routes

Implement navigation guards to prevent logged-out users from accessing protected screens.

## 8. Environment Configuration

### Backend (.env)

```
DATABASE_URL=mongodb://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:19000
```

### Frontend (.env)

```
REACT_APP_API_URL=http://your-backend-url
REACT_APP_ENV=development
```

## 9. Debugging Workflow

- **Frontend**: React Native Debugger, console.log, breakpoints
- **Backend**: Check server logs, use Postman for API testing
- **Network**: Monitor requests in Network tab
- **State**: Use Redux DevTools or Context debugging

## 10. Deployment Checklist

### Backend

- [ ] Set production environment variables
- [ ] Test all API endpoints (auth, user profile, analysis)
- [ ] Test ML model inference (check latency, accuracy)
- [ ] Deploy to cloud (Heroku, AWS, DigitalOcean, etc.)
- [ ] Set up database on production
- [ ] Configure CORS for frontend URL
- [ ] Set up S3/GCS for image storage
- [ ] Implement image cleanup job (delete old uploads)
- [ ] Monitor model inference performance
- [ ] Set up logging for failed analyses

### Frontend

- [ ] Update API URL to production
- [ ] Test image capture on real device (check permissions)
- [ ] Test analysis flow end-to-end
- [ ] Build production APK/IPA
- [ ] Submit to App Store / Google Play
- [ ] Set up continuous deployment
- [ ] Test with poor network conditions (timeout handling)

## Decision Points

**When to use Context vs Redux?**

- **Context**: Simple global state, small-medium apps
- **Redux**: Complex state, large apps with many actions

**When to use AsyncStorage vs SecureStore?**

- **AsyncStorage**: Non-sensitive data (user preferences, cache)
- **SecureStore**: Sensitive data (JWT tokens, passwords)

**When to connect to database?**

- Before shipping to production
- After authentication is working
- Once backend API is stable

## Quality Checks

- [ ] All screens navigable
- [ ] Authentication flow works end-to-end
- [ ] API calls include error handling
- [ ] Loading states show during API calls
- [ ] App doesn't crash on network errors
- [ ] Token is refreshed on expiry
- [ ] User can logout and login again
- [ ] App works on real device (not just emulator)
- [ ] **ML-specific**: Image capture works on real device
- [ ] **ML-specific**: Model inference completes within 5 seconds
- [ ] **ML-specific**: Results display correctly
- [ ] **ML-specific**: Analysis history is retrievable
- [ ] **ML-specific**: Failed analyses show error message (not crash)
- [ ] **ML-specific**: Image permissions are requested and handled
