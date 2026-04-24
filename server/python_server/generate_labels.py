import os
import csv

DATASET_PATH = "dataset"
OUTPUT_FILE = "labels.csv"

data = []

# ------------------------
# ACNE DATA
# ------------------------
acne_map = {
    "acne0": 0.0,
    "acne1": 0.3,
    "acne2": 0.6,
    "acne3": 0.9
}

acne_path = os.path.join(DATASET_PATH, "acne")

for folder in acne_map:
    folder_path = os.path.join(acne_path, folder)
    
    if not os.path.exists(folder_path):
        continue
    
    for img in os.listdir(folder_path):
        if img.endswith((".jpg", ".png", ".jpeg")):
            data.append([
                f"acne/{folder}/{img}",
                acne_map[folder],  # acne
                0.0                # wrinkles
            ])

# ------------------------
# WRINKLES DATA (FG-NET)
# ------------------------
wrinkle_path = os.path.join(DATASET_PATH, "wrinkles")

for img in os.listdir(wrinkle_path):
    if img.lower().endswith((".jpg", ".png", ".jpeg")):
        
        # extract age from filename (e.g., 001A45.jpg)
        try:
            age = int(img.split("A")[1].split(".")[0])
        except:
            continue

        # map age → wrinkles
        if age < 25:
            wrinkle_score = 0.1
        elif age < 40:
            wrinkle_score = 0.4
        else:
            wrinkle_score = 0.8

        data.append([
            f"wrinkles/{img}",
            0.0,               # acne
            wrinkle_score      # wrinkles
        ])

# ------------------------
# SAVE CSV
# ------------------------
with open(OUTPUT_FILE, mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["image", "acne", "wrinkles"])
    writer.writerows(data)

print(f"✅ labels.csv created with {len(data)} entries!")
