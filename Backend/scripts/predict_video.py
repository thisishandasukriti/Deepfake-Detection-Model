
import os
import cv2
import torch
import torch.nn as nn
from torchvision import transforms, models
import numpy as np
from tqdm import tqdm
import sys
from PIL import Image
from mtcnn.mtcnn import MTCNN

# ================== SETTINGS ==================
MODEL_PATH = "models/deepfake_model.pth"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMAGE_SIZE = 224
MAX_FRAMES = 30          # 🔥 Limit frames processed
MIN_CONFIDENCE = 0.90    # 🔥 Face confidence threshold
# =================================================

# ================== MODEL LOADING ==================
def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
    model = models.resnet18(weights=None)
    model.fc = nn.Sequential(
        nn.Dropout(p=0.5),
        nn.Linear(model.fc.in_features, 2)
    )
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.eval().to(DEVICE)
    return model

# ================== PREPROCESSING ==================
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ================== FACE EXTRACTION (MTCNN) ==================
def extract_faces_from_frame(frame_rgb, detector):
    """Extract padded, confidence-filtered face crops using MTCNN."""
    img_h, img_w = frame_rgb.shape[:2]
    try:
        results = detector.detect_faces(frame_rgb)
    except Exception:
        return []

    # 🔥 Filter by confidence
    results = [r for r in results if r['confidence'] >= MIN_CONFIDENCE]

    # 🔥 Limit to most confident face only
    results = results[:1]

    crops = []
    for r in results:
        x, y, w, h = r['box']
        x, y = max(0, x), max(0, y)

        # 🔥 Add padding for context (same as crop_faces.py)
        pad = int(0.15 * w)
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img_w, x + w + pad)
        y2 = min(img_h, y + h + pad)

        face = frame_rgb[y1:y2, x1:x2]
        if face.size > 0:
            crops.append(face)
    return crops

# ================== PREDICTION ==================
def predict_video(video_path):
    if not os.path.exists(video_path):
        print(f"❌ Video not found: {video_path}")
        return

    print(f"🎥 Processing video: {video_path}")
    print(f"🖥️  Running on: {DEVICE}")

    # 🔥 MTCNN instead of Haar Cascade
    detector = MTCNN()
    model = load_model()

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("❌ Could not open video.")
        return

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        print("❌ Invalid or empty video.")
        return

    # 🔥 Uniform sampling across video
    num_samples = min(MAX_FRAMES, total_frames) if total_frames > 0 else 1
    sample_indices = set(
        int(i * total_frames / num_samples) for i in range(num_samples)
    )

    preds = []

    

    for i in tqdm(range(total_frames), desc="Analyzing frames"):
        ret, frame = cap.read()
        if not ret:
            break

        if i not in sample_indices:

            continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        faces = extract_faces_from_frame(frame_rgb, detector)

        for face in faces:
            face_pil = Image.fromarray(face)
            face_tensor = transform(face_pil).unsqueeze(0).to(DEVICE)

            with torch.no_grad():
                output = model(face_tensor)
                probs = torch.softmax(output, dim=1)
                preds.append(probs.cpu().numpy())



    cap.release()

    if not preds:
        print("⚠️ No faces detected in video.")
        return {
            "label": "NO_FACES_DETECTED",
            "confidence": 0.0
        }

    preds = np.vstack(preds)
    avg_pred = preds.mean(axis=0)

    print(f"   Fake Prob : {avg_pred[0]:.4f}")
    print(f"   Real Prob : {avg_pred[1]:.4f}")

    # 🔥 Safe label mapping
    CLASS_NAMES = ["fake", "real"]  
    label = CLASS_NAMES[np.argmax(avg_pred)].upper()
    confidence = float(max(avg_pred))

    print(f"\n✅ Prediction Complete!")
    print(f"   Label     : {label}")
    print(f"   Confidence: {confidence:.4f}")
    print(f"   Frames used: {len(preds)}")

    return {
        "label": label,
        "confidence": confidence
    }

# ================== MAIN ==================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/predict_video.py <path_to_video>")
        sys.exit(1)
    video_path = sys.argv[1]
    result = predict_video(video_path)
    if result:
        print(f"\n🔍 Final Result: {result['label']} ({result['confidence']*100:.2f}%)")
