# SkinSpectrum — Project Documentation

---

## 1) Schema (MongoDB — User Model)

The application uses **MongoDB** (via Mongoose) with a single `users` collection. The actual schema fields stored in the database are:

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `name` | String | Required, trimmed |
| `email` | String | Required, unique, lowercase, trimmed |
| `password` | String | Optional (social logins have no password) |
| `googleId` | String | Unique, sparse index |
| `facebookId` | String | Unique, sparse index |
| `avatar` | String | Profile picture URL (from social providers) |
| `gender` | String | Set during onboarding |
| `age` | String | Age range, set during onboarding |
| `skinType` | String | Skin type classification |
| `skinConcerns` | [String] | Array of selected skin concerns |
| `facialAreas` | [String] | Array of selected facial focus areas |
| `userChallenges` | [String] | Array of selected skincare challenges |
| `isOnboardingComplete` | Boolean | Default: false |
| `createdAt` | Date | Auto-generated (Mongoose timestamps) |
| `updatedAt` | Date | Auto-generated (Mongoose timestamps) |

**Local Storage (AsyncStorage):** Skin analysis results history is stored on-device using `@react-native-async-storage/async-storage` under the key `@skinspectrum_analysis_history`.

**Secure Storage:** JWT auth tokens are stored on-device using `expo-secure-store`.

---

## 2) Modules Completed (or In Progress)

### ✅ Authentication & Account Personalization
- Email/Password registration and login with bcrypt hashing.
- Google OAuth (Native SDK via `@react-native-google-signin/google-signin`).
- Facebook OAuth (Native SDK via `react-native-fbsdk-next`).
- JWT-based session management (30-day expiry).
- Secure token storage via `expo-secure-store`.
- Password visibility toggle (eye icon) on Login and Signup screens.

### ✅ Multi-Step Onboarding Flow
- Privacy Consent Screen (Skin & Health Data + Facial Image Analysis consents).
- Medical Disclaimer Screen.
- Name entry.
- Gender selection.
- Age range selection.
- Skin Type selection.
- Facial Areas selection.
- Profile Setup & Review (summary of all selections, avatar placeholder).

### ✅ AI-Powered Cosmetic Skin Analysis
- Camera capture (front/back) and gallery upload via `expo-camera` and `expo-image-picker`.
- Face detection guard (rejects images with no face detected).
- Face shape detection using OpenCV Haar Cascade + skin-color contour analysis (YCrCb segmentation).
- **8-condition severity scoring** (0–10 scale): Acne, Dark Spots, Blackheads, Whiteheads, Pigmentation, Pores, Redness, Wrinkles.
- Acne grading (Clear / Mild / Moderate / Severe) via dedicated acne model.
- Dark circles detection using LAB color space analysis.
- Skin type inference from condition severities (Oily / Dry / Sensitive / Combination / Normal).
- Detailed Skin Health Report screen with detected vs. undetected conditions.
- Local analysis history save (AsyncStorage).

### ✅ AI-Powered Melanoma Detection
- Mole image capture and upload.
- Binary classification (Benign / Malignant / Unsure) via MobileNetV2 sigmoid model.
- Questionnaire-based risk scoring.
- Combined risk calculation (AI + questionnaire).
- UV Index retrieval and risk classification.
- Diagnosis results screen with gauges.
- Full detailed report screen with 2×2 grid layout.

### ✅ Dashboard & Engagement
- Personalized greeting (Good morning/afternoon/evening).
- Skin Health Score card.
- Quick Actions (Scan Skin, Melanoma).
- User Profile tags (skin type, skin concerns).
- Daily skincare tips.
- "Myth or Fact" skincare quiz game (5 questions).

### ✅ User Profile
- Profile screen with user data display.
- Sign out with cleanup of social sessions (Google, Facebook).
- Profile data sync between local context and backend.

### APIs Used
- **Current:**
  - **Open-Meteo API** — UV Index retrieval (`api.open-meteo.com/v1/forecast`).
  - **ipapi.co / ip-api.com** — IP-based geolocation fallback.
  - **Expo Location** — GPS-based location and reverse geocoding.
  - **Facebook Graph API** — User profile data during social auth.
  - **Google OAuth** — ID token verification via `google-auth-library`.
- **Planned:** Social media sharing SDKs, Chatbot.

---

## 3) Member Contribution

Git contributors found in the repository:

| Member | Contribution |
|---|---|
| **noorbatoolll** | [Fill in specific contribution] |
| **Quraisha Azam** | [Fill in specific contribution] |

---

## 4) Unit Testing (Manual — White Box)

| Function / Logic Under Test | File Location | What Was Tested |
|---|---|---|
| **Password validation regex** | `SignUpScreen.js` (line 156) | Regex `^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{12,})` — verifies password must be ≥12 chars, contain ≥1 number, ≥1 special character. |
| **Email validation** | `SignUpScreen.js` / `LoginScreen.js` | `keyboardType="email-address"` + `autoCapitalize="none"` — ensures valid email entry. Backend enforces uniqueness and lowercase. |
| **UV category classification** | `DiagnosisScreen.js` (lines 117–121) | `if (currentUv >= 11) → Extreme; >= 8 → Very High; >= 6 → High; >= 3 → Moderate; else → Low` |
| **Severity-to-label mapping** | `AnalysisResultsScreen.js` (lines 26–33) | `getSeverityLabel()`: 0→None, 1–2→Minimal, 3–4→Mild, 5–6→Moderate, 7–8→High, 9–10→Severe |
| **Probability-to-severity mapping** | `main.py` (lines 114–125) | `prob_to_severity()`: Converts ML probability (0.0–1.0) to severity integer (0–10) with specific thresholds. |
| **Acne grade mapping** | `main.py` (lines 383–389) | `level0→Clear(0), level1→Mild(3), level2→Moderate(6), level3→Severe(9)` |
| **Face shape classification** | `main.py` (lines 237–279) | `_classify_face_shape()`: Uses face contour ratio, forehead/cheekbone/jaw/chin widths to classify into Oblong, Heart, Diamond, Square, Rectangle, Round, Oval. |
| **Skin type inference** | `main.py` (lines 320–335) | `infer_skin_type()`: Maps condition severity combinations to Oily, Sensitive, Dry, Combination, or Normal. |
| **Skin image validation** | `main.py` (lines 337–348) | `is_skin_image()`: HSV skin-color ratio check (≥20% skin-colored pixels). |
| **Date/time formatting** | `DiagnosisScreen.js` (line 160) | `new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })` |

---

## 5) Functional Testing (Manual — Black Box)

| Test Area | Test Cases |
|---|---|
| **Sign Up** | Email/password registration, Google sign-up, Facebook sign-up, duplicate email rejection, password complexity enforcement (≥12 chars, number, special char), confirm password mismatch. |
| **Login** | Email/password login, Google login, Facebook login, wrong credentials error, social-only account trying password login. |
| **Onboarding Flow** | Privacy → Medical → Name → Gender → Age → Skin Type → Facial Areas → Profile Setup → Home. Consent toggles (both required to proceed). Back navigation at each step. |
| **Skin Analysis Camera** | Camera permission request, front/back camera switch, flash toggle, image capture, gallery upload, "No Face Detected" error handling, loading indicator during analysis. |
| **Skin Analysis Results** | All 8 conditions displayed, severity bars render correctly, detected vs. undetected split, acne grade display, face shape & skin type in summary card, dark circles conditional display, Save Results, New Scan navigation. |
| **Melanoma Module** | Welcome → About Melanoma → Scan/Upload → Questionnaire → Form → Diagnosis → Full Report. Image validation ("Mole couldn't be found"), prediction display (Benign/Malignant/Unsure), UV index fetch, risk score calculation. |
| **Home Dashboard** | Greeting based on time of day, user name display, Quick Actions navigation, Myth or Fact game, profile tags, daily tips. |
| **Profile** | User info display, sign out (clears token + social sessions). |

---

## 6) Integration Testing (Manual)

| Integration Point | What Was Tested |
|---|---|
| **Auth ↔ MongoDB** | User creation (`POST /api/auth/signup`), credential verification (`POST /api/auth/login`), JWT token generation, profile retrieval (`GET /api/auth/me`), profile update (`PUT /api/auth/profile`). |
| **React Native ↔ Node.js Backend** | Axios API calls with JWT Bearer token interceptor (`api.js`), multipart/form-data image upload for skin analysis and melanoma. |
| **Node.js Backend ↔ Python Flask Server** | Image forwarding from Express (`analyzeSkin.js`, `melanoma.js`) to Flask (`main.py`) via `axios.post` with `form-data`. |
| **Camera/Gallery ↔ Analysis Pipeline** | `expo-camera` capture → FormData → `/api/analyze-skin` → Python ML → JSON response → `AnalysisResultsScreen`. |
| **Location ↔ UV API** | `expo-location` GPS → lat/lon → `api.open-meteo.com` UV index → risk classification display. IP-based fallback (`ipapi.co` → `ip-api.com`). |
| **Onboarding ↔ User Profile** | Local context state (UserContext) → `syncProfileData()` → `PUT /api/auth/profile` → MongoDB update → `isOnboardingComplete: true`. |
| **Social Auth ↔ Backend** | Google ID Token → `google-auth-library` verification → User create/link. Facebook Access Token → Graph API → User create/link. |

---

## 7) System Testing (Manual)

| Test Type | What Was Tested |
|---|---|
| **End-to-End User Journey** | Full flow: App launch → Welcome → Intro → Sign Up (email or social) → Onboarding (Privacy → Medical → Name → Gender → Age → Skin Type → Facial Areas → Profile Setup) → Home → Skin Scan → Results → Save → Home → Melanoma → Full Report → Profile → Sign Out → Login. |
| **Security — Input Validation** | Password complexity regex enforcement (client-side), email uniqueness (server-side), required field checks on signup. |
| **Security — JWT** | Token generation with 30-day expiry (`jsonwebtoken`), Bearer token verification middleware (`middleware/auth.js`), user ID extraction from decoded token, invalid/expired token rejection (401). |
| **Security — Password Hashing** | `bcryptjs` with salt rounds of 10, password excluded from profile responses (`select('-password')`). |
| **Security — Secure Storage** | JWT stored in `expo-secure-store` (encrypted device storage), not AsyncStorage. |

---

## 8) Decision Table Testing

### UV Risk Classification

| UV Index | Risk Level |
|---|---|
| 0 – 2.9 | Low |
| 3 – 5.9 | Moderate |
| 6 – 7.9 | High |
| 8 – 10.9 | Very High |
| 11+ | Extreme |

### Password Validation Rules

| Condition | Passes? |
|---|---|
| `abc` (3 chars, no number, no special) | ❌ |
| `abcdefghijkl` (12 chars, no number, no special) | ❌ |
| `abcdefghijk1` (12 chars, has number, no special) | ❌ |
| `abcdefghij1!` (12 chars, has number, has special) | ✅ |
| `short1!` (7 chars) | ❌ |

### Melanoma Risk Level Classification

| Total Risk Score | Risk Level | Color |
|---|---|---|
| 0 – 35 | Low Risk | Green |
| 36 – 70 | Moderate Risk | Orange |
| 71 – 100 | High Risk | Red |

### Acne Grade Mapping

| Model Output | Grade Label | Severity Score |
|---|---|---|
| level0 | Clear | 0 |
| level1 | Mild | 3 |
| level2 | Moderate | 6 |
| level3 | Severe | 9 |

---

## 9) Business Rule Testing

| Business Rule | Verification |
|---|---|
| **Both privacy consents required** | User cannot proceed past the Privacy screen until both "Skin & Health Data" and "Facial Image Analysis" toggles are enabled. |
| **Onboarding must be completed** | If `isOnboardingComplete` is `false`, the user is routed to the Privacy screen (onboarding start) instead of Home, even with a valid JWT. |
| **Face detection guard** | The Python server returns a `400 NO_FACE` error if no face is detected in the uploaded image; the app shows "No Face Detected — Please retake the photo." |
| **Skin image validation** | For melanoma analysis, the server checks if the image contains ≥20% skin-colored pixels (HSV range); if not, returns `invalid_image` status with a prompt to retake. |
| **Social login — no password** | If a user registered via Google/Facebook (no password stored), attempting email login returns: "Please login using the social account you registered with." |
| **Melanoma confidence threshold** | If model confidence is below 90%, the prediction is overridden to "unsure" with the message: "Could be a normal mole, dark spot, or acne. Please consult a dermatologist." |
| **Password must not be returned** | All profile endpoints use `.select('-password')` to ensure the hashed password is never sent to the client. |

---

## 10) Architecture

The **SkinSpectrum** system adopts a **Client–Server Architecture** with a **Layered Backend** pattern:

```
┌─────────────────────────────────────────┐
│           React Native (Expo)           │  ← Mobile Client
│  Screens │ Components │ Context │ Services│
└──────────────────┬──────────────────────┘
                   │ REST API (HTTP/JSON)
                   ▼
┌─────────────────────────────────────────┐
│          Node.js / Express Server       │  ← API Gateway
│   Routes │ Middleware (JWT Auth) │ Models│
└──────┬──────────────────────┬───────────┘
       │                      │
       ▼                      ▼
┌─────────────┐    ┌─────────────────────┐
│   MongoDB   │    │  Python Flask Server │  ← ML Inference
│  (Mongoose) │    │  TensorFlow/Keras    │
│             │    │  OpenCV (face detect)│
│  Users      │    │  MobileNetV2 Models  │
└─────────────┘    └─────────────────────┘
```

**Layers:**
1. **Presentation Layer** — React Native screens, navigation, animations.
2. **State Management Layer** — React Context API (`UserContext`, `ImageContext`, `FormContext`, `PermissionsContext`).
3. **Service Layer** — Axios API client (`api.js`), local storage (`analysisStorage.js`).
4. **API Gateway** — Express.js server with JWT middleware, route handlers.
5. **ML Inference Layer** — Flask server with TensorFlow/Keras models for skin analysis and melanoma detection.
6. **Data Layer** — MongoDB for user data, AsyncStorage for analysis history, SecureStore for tokens.

---

## 11) Object Oriented Design (OO)

SkinSpectrum uses a **component-based, modular design** aligned with React Native's architecture:

- **Encapsulation**: User-specific data is encapsulated within `UserContext` — profile fields, auth state, and sync methods are accessed via the `useUser()` hook. The melanoma module has its own independent contexts (`FormContext`, `ImageContext`, `PermissionsContext`).
- **Separation of Concerns**: Each screen is a self-contained component responsible only for its UI and interaction logic. Business logic (API calls, auth) is abstracted into services (`api.js`, `analysisStorage.js`).
- **Reusable Components**: Common UI elements (`MythOrFactGame`, melanoma `Header`, `Footer`, `PrimaryButton`, `BaseScreen`) are shared across screens.
- **Provider Pattern**: Context Providers wrap the app tree (`UserProvider → PermissionProvider → ImageProvider → FormProvider`) enabling dependency injection of state and methods.
- **Model classes**: Backend uses Mongoose schema models (`User.js`) with validation rules, type enforcement, and indexing (unique, sparse).

---

## 12) Technical Stack & Data Flow

### Technologies

| Layer | Technology |
|---|---|
| **Frontend** | React Native 0.83, Expo SDK 55 |
| **Navigation** | React Navigation (Native Stack) |
| **State** | React Context API |
| **Auth** | JWT (`jsonwebtoken`), bcryptjs, Google Auth Library, Facebook SDK |
| **Camera** | `expo-camera`, `expo-image-picker` |
| **Storage** | `expo-secure-store` (tokens), `@react-native-async-storage/async-storage` (analysis history) |
| **API Gateway** | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose 9) |
| **ML Server** | Python, Flask, Flask-CORS |
| **ML Framework** | TensorFlow/Keras |
| **ML Architecture** | MobileNetV2 (transfer learning) — 3 models: Acne (4-class softmax), Skin (8-class softmax), Melanoma (binary sigmoid) |
| **Computer Vision** | OpenCV (Haar Cascade face detection, skin segmentation, contour analysis, dark circle detection) |
| **Image Processing** | Pillow (PIL), NumPy |
| **Location** | `expo-location`, ipapi.co, ip-api.com |
| **Weather/UV** | Open-Meteo API |
| **UI** | `expo-linear-gradient`, `react-native-reanimated`, `@expo/vector-icons` |

### Data Flow

```
User → Camera/Gallery → Image Capture
  → FormData Upload → Express Server (/api/analyze-skin or /api/melanoma/analyze-melanoma)
    → Forward to Flask Python Server (port 5001)
      → Image preprocessing (PIL resize to 224×224, normalize to 0–1)
      → TensorFlow MobileNetV2 inference
      → OpenCV face detection + shape + dark circles analysis
      → JSON response (severities, grade, face shape, skin type)
    ← Express returns JSON to client
  ← React Native displays results in AnalysisResultsScreen / DiagnosisScreen
  → Optional: Save to AsyncStorage (local history)
```

### Control Flow

```
App Launch → Check SecureStore for JWT
  → Token found → Fetch profile (GET /api/auth/me)
    → isOnboardingComplete? → Home
    → !isOnboardingComplete? → Privacy (start onboarding)
  → No token → Welcome → Intro → Login/Signup
```
