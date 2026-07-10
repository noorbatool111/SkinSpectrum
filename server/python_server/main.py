import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import cv2
from tensorflow.keras.models import Model
# pyrefly: ignore [missing-import]
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────
# LOAD MODELS
# ─────────────────────────────────────────────
def build_acne_model():
    base_model = MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3))
    x = GlobalAveragePooling2D()(base_model.output)
    x = Dropout(0.3)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(4, activation='softmax')(x)
    return Model(inputs=base_model.input, outputs=predictions)

def build_skin_model():
    base_model = MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3))
    x = GlobalAveragePooling2D()(base_model.output)
    x = Dropout(0.4)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(8, activation='softmax')(x)
    return Model(inputs=base_model.input, outputs=predictions)

def build_melanoma_model():
    base_model = MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3))
    x = GlobalAveragePooling2D()(base_model.output)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(1, activation='sigmoid')(x)
    return Model(inputs=base_model.input, outputs=predictions)

print("Loading models...")

acne_model = None
ACNE_PATH = os.path.join(BASE_DIR, 'acne_model_final.keras')
if os.path.exists(ACNE_PATH):
    try:
        acne_model = build_acne_model()
        acne_model.load_weights(ACNE_PATH)
        print("Acne model loaded!")
    except Exception as e:
        print(f"Acne load error: {e}")

skin_model = None
SKIN_PATH = os.path.join(BASE_DIR, 'skin_model_final.keras')
if os.path.exists(SKIN_PATH):
    try:
        skin_model = build_skin_model()
        skin_model.load_weights(SKIN_PATH)
        print("Skin model loaded!")
    except Exception as e:
        print(f"Skin load error: {e}")

melanoma_model = None
MELANOMA_PATH = os.path.join(BASE_DIR, 'melanoma_model.keras')
if os.path.exists(MELANOMA_PATH):
    try:
        melanoma_model = build_melanoma_model()
        melanoma_model.load_weights(MELANOMA_PATH)
        print("Melanoma model loaded!")
    except Exception as e:
        print(f"Melanoma load error: {e}")

print("All models loaded!")

# ─────────────────────────────────────────────
# OPENCV FACE DETECTION
# ─────────────────────────────────────────────
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# ─────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────
acne_classes = ['level0', 'level1', 'level2', 'level3']

skin_model_classes = [
    'Redness', 'dark spots', 'inflammatory acne',
    'non inflammatory acne black heads',
    'non inflammatory acne white heads',
    'pigmentation', 'pores', 'wrinkles'
]

DISPLAY_NAMES = {
    'Redness': 'Redness',
    'dark spots': 'Dark Spots',
    'inflammatory acne': 'Acne',
    'non inflammatory acne black heads': 'Blackheads',
    'non inflammatory acne white heads': 'Whiteheads',
    'pigmentation': 'Pigmentation',
    'pores': 'Pores',
    'wrinkles': 'Wrinkles',
}

REPORT_CONDITIONS = [
    'Acne', 'Dark Spots', 'Blackheads', 'Whiteheads',
    'Pigmentation', 'Pores', 'Redness', 'Wrinkles'
]

# ─────────────────────────────────────────────
# SOFTMAX THRESHOLD CONSTANTS
# ─────────────────────────────────────────────
# Softmax with 8 classes has a random baseline of 1/8 = 0.125.
# A probability must be well above this to indicate a real condition.
SKIN_CONDITION_THRESHOLD = 0.35   # below this → severity 0 (healthy)
ACNE_CONFIDENCE_THRESHOLD = 0.50  # below this → default to "Clear"

def prob_to_severity(prob, threshold=SKIN_CONDITION_THRESHOLD):
    """Convert a softmax probability to severity 0-10, with threshold gating."""
    if prob < threshold:
        return 0
    # Scale the remaining range (threshold → 1.0) into severity 1-10
    scaled = (prob - threshold) / (1.0 - threshold)  # 0.0 → 1.0
    severity = int(round(scaled * 9)) + 1  # 1 → 10
    return min(severity, 10)

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def preprocess_image(image_bytes, target_size=(224, 224)):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(target_size)
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

def detect_face_and_shape(img_bgr):
    """
    Detects the face and determines face shape by extracting the actual skin
    contour from the face ROI using color segmentation, then measuring widths
    at forehead, cheekbone, jawline, and chin levels.
    """
    try:
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
        if len(faces) == 0:
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(60, 60))
        if len(faces) == 0:
            print("[FaceDetect] No face found")
            return None, None

        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        print(f"[FaceDetect] Face found at ({x},{y}) size {w}x{h}")

        # --- Extract the actual face contour using skin-color segmentation ---
        # Expand the bounding box slightly to capture chin and forehead
        pad_x = int(w * 0.15)
        pad_y = int(h * 0.15)
        ex1 = max(0, x - pad_x)
        ey1 = max(0, y - pad_y)
        ex2 = min(img_bgr.shape[1], x + w + pad_x)
        ey2 = min(img_bgr.shape[0], y + h + pad_y)
        face_region = img_bgr[ey1:ey2, ex1:ex2]

        # Convert to YCrCb for robust skin detection
        ycrcb = cv2.cvtColor(face_region, cv2.COLOR_BGR2YCrCb)
        skin_mask = cv2.inRange(ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))

        # Clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=1)

        # Find the largest contour (the face outline)
        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            print("[FaceDetect] No skin contour found, falling back to bbox ratio")
            return _classify_by_bbox_ratio(w, h), (x, y, w, h)

        face_contour = max(contours, key=cv2.contourArea)
        contour_area = cv2.contourArea(face_contour)
        roi_area = face_region.shape[0] * face_region.shape[1]

        if contour_area < roi_area * 0.15:
            print("[FaceDetect] Contour too small, falling back to bbox ratio")
            return _classify_by_bbox_ratio(w, h), (x, y, w, h)

        # Get the bounding rect of the actual face contour
        cx, cy, cw, ch = cv2.boundingRect(face_contour)
        face_ratio = ch / cw if cw > 0 else 1.0

        # Measure widths at different vertical levels of the contour
        def measure_width_at_level(contour, mask, level_pct):
            """Measure how wide the skin is at a given vertical percentage of the contour bbox."""
            target_y = cy + int(ch * level_pct)
            row = mask[target_y, cx:cx+cw] if 0 <= target_y < mask.shape[0] else np.array([])
            if row.size == 0:
                return 0.5
            white_pixels = np.where(row > 0)[0]
            if len(white_pixels) < 2:
                return 0.3
            return (white_pixels[-1] - white_pixels[0]) / cw

        forehead_w = measure_width_at_level(face_contour, skin_mask, 0.15)
        cheekbone_w = measure_width_at_level(face_contour, skin_mask, 0.40)
        jaw_w = measure_width_at_level(face_contour, skin_mask, 0.75)
        chin_w = measure_width_at_level(face_contour, skin_mask, 0.90)

        print(f"[FaceDetect] Contour ratio={face_ratio:.2f}, forehead={forehead_w:.2f}, "
              f"cheek={cheekbone_w:.2f}, jaw={jaw_w:.2f}, chin={chin_w:.2f}")

        # --- Classify face shape based on proportions ---
        shape = _classify_face_shape(face_ratio, forehead_w, cheekbone_w, jaw_w, chin_w)

        print(f"[FaceDetect] Shape={shape}")
        return shape, (x, y, w, h)

    except Exception as e:
        print(f"[FaceDetect] Error: {e}")
        return None, None


def _classify_by_bbox_ratio(w, h):
    """Simple fallback when contour analysis fails."""
    ratio = h / w if w > 0 else 1.0
    if ratio > 1.35:
        return "Oblong"
    elif ratio > 1.15:
        return "Oval"
    elif ratio > 0.95:
        return "Round"
    else:
        return "Oval"


def _classify_face_shape(ratio, forehead_w, cheekbone_w, jaw_w, chin_w):
    """
    Classify face shape using measured proportions:
    - ratio: height/width of face contour
    - forehead_w, cheekbone_w, jaw_w, chin_w: normalized widths (0-1) at each level
    """
    # The widest point
    widths = {'forehead': forehead_w, 'cheekbone': cheekbone_w, 'jaw': jaw_w}
    widest = max(widths, key=widths.get)
    max_w = max(forehead_w, cheekbone_w, jaw_w)
    taper = cheekbone_w - jaw_w  # how much the face narrows toward the jaw
    chin_taper = jaw_w - chin_w  # how pointed the chin is

    # Oblong: much taller than wide
    if ratio > 1.45:
        return "Oblong"

    # Heart: forehead is widest, significant jaw taper, pointed chin
    if widest == 'forehead' and taper > 0.12 and chin_w < 0.45:
        return "Heart"

    # Diamond: cheekbones widest, both forehead and jaw significantly narrower
    if widest == 'cheekbone' and (cheekbone_w - forehead_w) > 0.08 and taper > 0.10:
        return "Diamond"

    # Square: face is nearly as wide as tall, jaw is wide and angular
    if ratio < 1.15 and jaw_w > 0.75 and abs(forehead_w - jaw_w) < 0.10:
        return "Square"

    # Rectangle: tall face with wide jaw (like square but elongated)
    if ratio > 1.25 and jaw_w > 0.70 and abs(forehead_w - jaw_w) < 0.12:
        return "Rectangle"

    # Round: short face, similar widths, soft jaw
    if ratio < 1.20 and abs(forehead_w - jaw_w) < 0.12 and cheekbone_w >= jaw_w:
        return "Round"

    # Oval: moderate ratio, cheekbones widest or similar, gentle taper
    if ratio > 1.10 and cheekbone_w >= forehead_w * 0.9 and taper > 0.02:
        return "Oval"

    # Default to Oval as it's the most common
    return "Oval"

def check_actual_redness(img_bgr, face_rect):
    """
    Validates if the face actually contains a significant amount of red pixels
    using HSV color space. Helps filter out false positives from the ML model.
    """
    try:
        x, y, w, h = face_rect
        face_roi = img_bgr[y:y+h, x:x+w]
        
        hsv = cv2.cvtColor(face_roi, cv2.COLOR_BGR2HSV)
        
        # Red hue wraps around 0/180 in OpenCV (H is 0-179)
        # We look for colors that are distinctly red/pink
        mask1 = cv2.inRange(hsv, np.array([0, 40, 50]), np.array([12, 255, 255]))
        mask2 = cv2.inRange(hsv, np.array([165, 40, 50]), np.array([180, 255, 255]))
        red_mask = cv2.bitwise_or(mask1, mask2)
        
        # Calculate percentage of red pixels
        red_ratio = cv2.countNonZero(red_mask) / (w * h)
        print(f"[CV-Check] Redness pixel ratio: {red_ratio:.3f}")
        
        # If less than ~4% of the face is red, it's likely a false positive
        return red_ratio > 0.04
    except Exception as e:
        print(f"[CV-Check] Redness error: {e}")
        return True # Default to true to not override model if CV fails

def detect_dark_circles(img_bgr, face_rect):
    try:
        x, y, w, h = face_rect
        img_lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)

        under_eye_y1 = y + int(h * 0.45)
        under_eye_y2 = y + int(h * 0.55)
        left_ue_x1  = x + int(w * 0.15)
        left_ue_x2  = x + int(w * 0.40)
        right_ue_x1 = x + int(w * 0.60)
        right_ue_x2 = x + int(w * 0.85)
        cheek_y1    = y + int(h * 0.55)
        cheek_y2    = y + int(h * 0.70)
        cheek_x1    = x + int(w * 0.20)
        cheek_x2    = x + int(w * 0.80)

        def region_brightness(region):
            if region.size == 0:
                return 128
            return float(np.mean(region[:, :, 0]))

        left_b  = region_brightness(img_lab[under_eye_y1:under_eye_y2, left_ue_x1:left_ue_x2])
        right_b = region_brightness(img_lab[under_eye_y1:under_eye_y2, right_ue_x1:right_ue_x2])
        under_eye_b = (left_b + right_b) / 2
        cheek_b = region_brightness(img_lab[cheek_y1:cheek_y2, cheek_x1:cheek_x2])

        darkness_diff = cheek_b - under_eye_b
        detected = darkness_diff > 12
        severity = int(min(max(round(darkness_diff / 4), 0), 10)) if detected else int(max(round(darkness_diff / 8), 0))

        return {
            'detected': bool(detected),
            'severity': severity,
            'darkness_score': round(float(darkness_diff), 1)
        }
    except Exception as e:
        print(f"Dark circle detection error: {e}")
        return {'detected': False, 'severity': 0, 'darkness_score': 0}

def infer_skin_type(condition_severities):
    acne_sev        = condition_severities.get('Acne', 0)
    pores_sev       = condition_severities.get('Pores', 0)
    redness_sev     = condition_severities.get('Redness', 0)
    pigmentation_sev = condition_severities.get('Pigmentation', 0)

    if acne_sev >= 4 and pores_sev >= 4:
        return "Oily"
    elif redness_sev >= 4 and pores_sev <= 3:
        return "Sensitive"
    elif pigmentation_sev >= 4 and redness_sev <= 3:
        return "Dry"
    elif acne_sev >= 3 or pores_sev >= 3:
        return "Combination"
    else:
        return "Normal"

def is_skin_image(image_bytes):
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return False
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, np.array([0, 15, 60]), np.array([30, 255, 255]))
        skin_ratio = cv2.countNonZero(mask) / (img.shape[0] * img.shape[1])
        return skin_ratio >= 0.20
    except:
        return True

# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────
@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    image_bytes = image_file.read()

    if not acne_model or not skin_model:
        return jsonify({'error': 'Models not loaded'}), 500

    img_array = preprocess_image(image_bytes)

    # ── Skin model predictions (with softmax threshold gating) ──
    skin_preds = skin_model.predict(img_array, verbose=0)[0]
    raw_probs = dict(zip(skin_model_classes, [round(float(p), 3) for p in skin_preds]))
    print(f"[SkinModel] Raw probs: {raw_probs}")

    # Check if the model is actually confident about any condition.
    # With 8-class softmax, random baseline is ~0.125.
    # If the top probability is below the threshold, the model is uncertain → treat as healthy.
    top_prob = float(np.max(skin_preds))
    skin_is_healthy = top_prob < SKIN_CONDITION_THRESHOLD

    if skin_is_healthy:
        print(f"[SkinModel] Top prob {top_prob:.3f} < {SKIN_CONDITION_THRESHOLD} → treating as healthy skin")

    # Build severity map for all 8 conditions
    condition_severities = {}
    for i, cls_name in enumerate(skin_model_classes):
        display_name = DISPLAY_NAMES[cls_name]
        prob = float(skin_preds[i])
        if skin_is_healthy:
            condition_severities[display_name] = 0
        else:
            condition_severities[display_name] = prob_to_severity(prob)

    # ── Acne model — overrides Acne severity (with confidence gating) ──
    acne_preds = acne_model.predict(img_array, verbose=0)[0]
    acne_class_idx = int(np.argmax(acne_preds))
    acne_class = acne_classes[acne_class_idx]
    acne_confidence = float(np.max(acne_preds))

    grade_map = {
        'level0': ('Clear',    0),
        'level1': ('Mild',     3),
        'level2': ('Moderate', 6),
        'level3': ('Severe',   9),
    }

    # If model predicts Clear, always respect it.
    # If model predicts acne but confidence is too low, default to Clear.
    if acne_class == 'level0':
        acne_grade, acne_severity = 'Clear', 0
    elif acne_confidence < ACNE_CONFIDENCE_THRESHOLD:
        print(f"[AcneModel] Confidence {acne_confidence:.3f} < {ACNE_CONFIDENCE_THRESHOLD} → defaulting to Clear")
        acne_grade, acne_severity = 'Clear', 0
    else:
        acne_grade, acne_severity = grade_map.get(acne_class, ('Mild', 3))

    condition_severities['Acne'] = acne_severity

    print(f"[AcneModel] grade={acne_grade} severity={acne_severity} conf={acne_confidence:.3f}")

    # ── Face detection + shape + dark circles + CV Validation ──
    face_shape = "Oval"
    dark_circles = {'detected': False, 'severity': 0, 'darkness_score': 0}

    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        print(f"[FaceDetect] Image size: {img_bgr.shape[1]}x{img_bgr.shape[0]}")

        detected_shape, face_rect = detect_face_and_shape(img_bgr)

        if not detected_shape:
            return jsonify({
                'error': 'NO_FACE',
                'message': 'No face detected. Please retake the photo with your face clearly visible.'
            }), 400

        face_shape = detected_shape
        if face_rect:
            dark_circles = detect_dark_circles(img_bgr, face_rect)
            
            # --- CV VALIDATION FOR REDNESS ---
            if condition_severities.get('Redness', 0) > 0:
                is_actually_red = check_actual_redness(img_bgr, face_rect)
                if not is_actually_red:
                    print(f"[CV-Check] Overriding Redness ({condition_severities['Redness']}) to 0 due to lack of actual red pixels")
                    condition_severities['Redness'] = 0

    except Exception as e:
        print(f"Face detection error: {e}")

    # ── Build full conditions list (all 8, sorted by severity) ──
    # We do this here so it includes any CV validation overrides
    all_conditions = sorted(
        [{'condition': name, 'severity': condition_severities.get(name, 0)} for name in REPORT_CONDITIONS],
        key=lambda x: x['severity'],
        reverse=True
    )

    # ── Top 3 non-acne conditions (acne already shown separately) ──
    top3_conditions = [c for c in all_conditions if c['condition'] != 'Acne'][:3]

    # ── Skin type ──
    skin_type = infer_skin_type(condition_severities)

    return jsonify({
        'acne': {
            'grade': acne_grade,
            'confidence': round(acne_confidence * 100, 1),
            'severity': acne_severity
        },
        'skin_conditions': top3_conditions,   # top 3 non-acne conditions by severity
        'all_conditions': all_conditions,      # full 8 — useful for saving/charting later
        'face_shape': face_shape,
        'skin_type': skin_type,
        'dark_circles': dark_circles
    })


@app.route('/analyze-melanoma', methods=['POST'])
def analyze_melanoma():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    image_bytes = image_file.read()

    if not is_skin_image(image_bytes):
        return jsonify({
            'status': 'invalid_image',
            'message': "Mole couldn't be found. Please take a clear, close-up image of the mole."
        })

    img_array = preprocess_image(image_bytes)

    if not melanoma_model:
        return jsonify({'status': 'error', 'message': 'Melanoma model not loaded'}), 500

    score = float(melanoma_model.predict(img_array)[0][0])
    prediction = "malignant" if score > 0.5 else "benign"
    confidence = score if score > 0.5 else 1 - score

    if confidence < 0.90:
        prediction = "unsure"
        message = "Unsure. Could be a normal mole, dark spot, or acne. Please consult a dermatologist."
    else:
        message = "Analysis complete"

    return jsonify({
        'status': 'success',
        'prediction': prediction,
        'confidence': round(confidence * 100, 1),
        'message': message
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'models': {
            'acne': acne_model is not None,
            'skin': skin_model is not None,
            'melanoma': melanoma_model is not None
        }
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)