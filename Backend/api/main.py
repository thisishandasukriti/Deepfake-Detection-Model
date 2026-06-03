import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import transforms, models
import numpy as np
import cv2
from PIL import Image

# ---------- SETTINGS ----------
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "deepfake_model.pth")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMAGE_SIZE = 224
FRAME_INTERVAL = 10
FACE_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # use your localhost or domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- LOAD MODEL ONCE ----------
def load_model():
    model = models.resnet18(weights=None)
    model.fc = nn.Sequential(
        nn.Dropout(p=0.5),
        nn.Linear(model.fc.in_features, 2)
    )
    model.load_state_dict(
        torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
    )
    model.eval().to(DEVICE)
    return model

model = load_model()  # ← loaded ONCE
face_cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)

# ---------- TRANSFORMATION ----------
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ---------- FACE EXTRACTION ----------
def extract_faces_from_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    crops = []

    for (x, y, w, h) in faces:
        face = frame[y:y+h, x:x+w]
        crops.append(face)

    return crops

# ---------- PREDICT FUNCTION ----------
def run_prediction(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    preds = []

    for i in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            break

        if i % FRAME_INTERVAL != 0:
            continue

        faces = extract_faces_from_frame(frame)

        for face in faces:
            face_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
            face_pil = Image.fromarray(face_rgb)
            face_tensor = transform(face_pil).unsqueeze(0).to(DEVICE)

            with torch.no_grad():
                output = model(face_tensor)
                probs = torch.softmax(output, dim=1)
                preds.append(probs.cpu().numpy())

    cap.release()

    if not preds:
        return {"error": "No faces detected"}

    preds = np.vstack(preds)
    avg_pred = preds.mean(axis=0)

    label = "REAL" if avg_pred[1] > avg_pred[0] else "FAKE"
    confidence = float(max(avg_pred))

    return {
        "label": label,
        "confidence": confidence
    }

# ---------- API ROUTE ----------
@app.post("/predict")
async def predict_video_api(file: UploadFile = File(...)):
    temp_id = str(uuid.uuid4())
    temp_path = f"temp_{temp_id}.mp4"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = run_prediction(temp_path)

    os.remove(temp_path)

    return result
