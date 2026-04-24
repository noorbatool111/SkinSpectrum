import os
import cv2
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, Flatten, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping

# -------------------------
# PATHS
# -------------------------
DATASET_PATH = "dataset"
CSV_PATH = "labels.csv"

# -------------------------
# LOAD CSV
# -------------------------
df = pd.read_csv(CSV_PATH)

images = []
labels = []

# -------------------------
# LOAD & PREPROCESS IMAGES
# -------------------------
for _, row in df.iterrows():
    img_path = os.path.join(DATASET_PATH, row['image'])

    if not os.path.exists(img_path):
        continue

    img = cv2.imread(img_path)

    if img is None:
        continue

    # 🔥 FACE FOCUS (important)
    h, w, _ = img.shape
    img = img[int(h*0.2):int(h*0.9), int(w*0.2):int(w*0.8)]

    # Resize + Normalize
    img = cv2.resize(img, (224, 224))
    img = img / 255.0

    images.append(img)
    labels.append([row['acne'], row['wrinkles']])

X = np.array(images)
y = np.array(labels)

print("✅ Data Loaded:", X.shape, y.shape)

# -------------------------
# TRAIN / TEST SPLIT
# -------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------
# MODEL (TRANSFER LEARNING)
# -------------------------
base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)

x = base_model.output
x = Flatten()(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.3)(x)
output = Dense(2, activation='sigmoid')(x)

model = Model(inputs=base_model.input, outputs=output)

# -------------------------
# FINE-TUNING (IMPORTANT)
# -------------------------
for layer in base_model.layers[:-60]:
    layer.trainable = False

for layer in base_model.layers[-60:]:
    layer.trainable = True

# -------------------------
# COMPILE
# -------------------------
model.compile(
    optimizer=Adam(learning_rate=0.0001),
    loss='mse',
    metrics=['mae']
)

# -------------------------
# CALLBACKS
# -------------------------
early_stop = EarlyStopping(
    monitor='val_loss',
    patience=3,
    restore_best_weights=True
)

# -------------------------
# TRAIN
# -------------------------
history = model.fit(
    X_train,
    y_train,
    validation_data=(X_test, y_test),
    epochs=20,
    batch_size=16,
    callbacks=[early_stop]
)

# -------------------------
# SAVE MODEL
# -------------------------
model.save("skin_model.h5")

print("🎉 Model trained and saved successfully!")