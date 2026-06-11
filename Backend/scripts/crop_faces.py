from mtcnn.mtcnn import MTCNN
import cv2
import os
import psutil
import time
from multiprocessing import Pool, cpu_count

# ================== PATHS ==================
frames_folder = "/backend/data/processed_frames"
faces_folder = "/backend/data/cropped_faces"

# ================== SETUP ==================
os.makedirs(faces_folder, exist_ok=True)
for label in ["real", "fake"]:
    os.makedirs(os.path.join(faces_folder, label), exist_ok=True)

# ================== GLOBAL DETECTOR ==================
detector = None

# ================== PARAMETERS ==================
MAX_SIZE = 1080
OUTPUT_SIZE = (224, 224)
PADDING_RATIO = 0.20   #  safe padding (fixes tight crops)

# ================== INIT ==================
def init_worker():
    global detector
    detector = MTCNN()

# ================== PROCESS FRAME ==================
def process_frame(args):
    global detector
    frame_path, label = args
    frame_file = os.path.basename(frame_path)

    image = cv2.imread(frame_path)
    if image is None:
        return f" Skipped: {frame_file}"

    # Resize large images (same as before)
    if max(image.shape[:2]) > MAX_SIZE:
        scale = MAX_SIZE / max(image.shape[:2])
        image = cv2.resize(
            image,
            (int(image.shape[1]*scale), int(image.shape[0]*scale)),
            interpolation=cv2.INTER_AREA
        )

    img_h, img_w = image.shape[:2]
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    try:
        results = detector.detect_faces(image_rgb)
    except Exception as e:
        return f"⚠️ Error: {frame_file}"

    output_label_folder = os.path.join(faces_folder, label)
    saved_faces = 0

    for i, result in enumerate(results):
        x, y, w, h = result['box']

        # Fix negative values
        x, y = max(0, x), max(0, y)

        # ================== SAFE PADDING ==================
        pad = int(min(w, h) * PADDING_RATIO)

        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img_w, x + w + pad)
        y2 = min(img_h, y + h + pad)

        face = image[y1:y2, x1:x2]

        # Validate
        if face is None or face.size == 0:
            continue

        # ================== STANDARDIZE SIZE ==================
        face = cv2.resize(face, OUTPUT_SIZE)

        face_filename = f"{os.path.splitext(frame_file)[0]}_face{i}.jpg"
        face_path = os.path.join(output_label_folder, face_filename)

        cv2.imwrite(face_path, face)
        saved_faces += 1

    return f" {frame_file} → {saved_faces} face(s)"

# ================== TASKS ==================
tasks = []
for label in ["real", "fake"]:
    label_folder = os.path.join(frames_folder, label)
    if not os.path.exists(label_folder):
        continue

    for frame_file in os.listdir(label_folder):
        if frame_file.lower().endswith(".jpg"):
            tasks.append((os.path.join(label_folder, frame_file), label))

total_frames = len(tasks)
print(f" Total frames: {total_frames}")

# ================== WORKERS ==================
available_mem_gb = psutil.virtual_memory().available / (1024**3)

if available_mem_gb < 4:
    NUM_WORKERS = 2
elif available_mem_gb < 8:
    NUM_WORKERS = 4
else:
    NUM_WORKERS = min(8, cpu_count() - 1)

print(f" Using {NUM_WORKERS} workers...\n")

# ================== RUN ==================
if __name__ == "__main__":
    start_time = time.time()

    with Pool(processes=NUM_WORKERS, initializer=init_worker) as pool:
        for i, result in enumerate(pool.imap_unordered(process_frame, tasks), 1):

            if i % 500 == 0 or i == total_frames:
                elapsed = time.time() - start_time
                fps = i / elapsed if elapsed > 0 else 0
                remaining = total_frames - i
                eta = remaining / fps if fps > 0 else 0

                print(f"[{i}/{total_frames}] {result}")
                print(f"   ⏱ {fps:.2f} fps | ETA: {int(eta//60)}m {int(eta%60)}s\n")

    total_time = time.time() - start_time

    print("\n Done.")
    print(f" Time: {total_time/60:.2f} minutes")
