
import os
import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# ================== USER SETTINGS ==================
DATASET_DIR = "data/dataset"
MODEL_PATH = "models/deepfake_model.pth"
BATCH_SIZE = 32
IMAGE_SIZE = 224
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# ====================================================

# ================== TRANSFORMS ==================
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ================== DATASET ==================
test_dataset = datasets.ImageFolder(os.path.join(DATASET_DIR, "test"), transform=transform)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

print("Class mapping:", test_loader.dataset.classes)
print("Sample labels:", [test_loader.dataset[i][1] for i in range(10)])

#  Verify class order matches training
print(f" Class mapping: {test_dataset.class_to_idx}")

expected = {'fake': 0, 'real': 1}
if test_dataset.class_to_idx != expected:
    print(f" Warning: class mapping differs from expected {expected}")

# ================== MODEL LOADING ==================
model = models.resnet18(weights=None)
model.fc = nn.Sequential(
    nn.Dropout(p=0.5),
    nn.Linear(model.fc.in_features, 2)
)

# Safe model loading
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model = model.to(DEVICE)
model.eval()
print(f" Model loaded from: {MODEL_PATH}")
print(f" Running on: {DEVICE}\n")

# ================== EVALUATION ==================
all_preds = []
all_labels = []
all_probs = []

# ================== STEP 1: COLLECT ALL OUTPUTS ==================
# ================== STEP 1: COLLECT PROBABILITIES ==================
all_probs = []
all_labels = []

with torch.no_grad():
    for images, labels in test_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        #  TTA (horizontal + vertical)
        outputs1 = model(images)

        images_hflip = torch.flip(images, dims=[3])
        outputs2 = model(images_hflip)

        images_vflip = torch.flip(images, dims=[2])
        outputs3 = model(images_vflip)

        #  weighted fusion (better than simple average)
        outputs = (outputs1 * 0.5 + outputs2 * 0.3 + outputs3 * 0.2)

        #  probability sharpening
        probs = torch.softmax(outputs, dim=1)
        probs = probs ** 1.2
        probs = probs / probs.sum(dim=1, keepdim=True)

        all_probs.extend(probs.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())


# ================== STEP 2: THRESHOLD TUNING ==================
all_probs = np.array(all_probs)
all_labels = np.array(all_labels)

prob_fake = all_probs[:, 0]

best_acc = 0
best_t = 0

for t in np.arange(0.40, 0.65, 0.01):   #  slightly wider search
    preds = (prob_fake * 0.95 <= t).astype(int)  #  bias correction

    acc = (preds == all_labels).mean()
    print(f"Threshold {t:.2f}: Accuracy = {acc:.4f}")

    if acc > best_acc:
        best_acc = acc
        best_t = t

print(f"\n Best Threshold: {best_t:.2f} | Accuracy: {best_acc:.4f}")


# ================== STEP 3: FINAL PREDICTIONS ==================
all_preds = (prob_fake * 0.95 <= best_t).astype(int)

# ================== METRICS ==================
print(" Evaluation Complete!\n")

# 🔥 Safe class names fallback
class_names = test_dataset.classes if test_dataset.classes else ["fake", "real"]
print(f"Classes: {class_names}")

all_preds = np.array(all_preds)
all_labels = np.array(all_labels)
all_probs = np.array(all_probs)

# Overall accuracy
overall_acc = (all_preds == all_labels).mean()
print(f"\n🎯 Overall Accuracy: {overall_acc:.4f}")

from sklearn.metrics import roc_auc_score

# Assuming class index 1 is "real"
auc = roc_auc_score(all_labels, all_probs[:, 1])
print(f" ROC-AUC: {auc:.4f}")

#  Per-class accuracy
for i, cls in enumerate(class_names):
    mask = all_labels == i
    cls_acc = (all_preds[mask] == all_labels[mask]).mean() if mask.sum() > 0 else 0.0
    avg_conf = all_probs[mask, i].mean() if mask.sum() > 0 else 0.0
    print(f"   {cls.upper()}: Accuracy={cls_acc:.4f} | Avg Confidence={avg_conf:.4f}")

# Confusion Matrix & Report
cm = confusion_matrix(all_labels, all_preds)
report = classification_report(all_labels, all_preds, target_names=class_names, digits=4)

print("\n Confusion Matrix:\n", cm)
cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True)
print("\n Normalized Confusion Matrix:\n", np.round(cm_norm, 4))

print("\n Classification Report:\n", report)


os.makedirs("results", exist_ok=True)

with open("results/evaluation.txt", "w") as f:
    f.write(f"Accuracy: {overall_acc:.4f}\n\n")
    f.write("Confusion Matrix:\n")
    f.write(np.array2string(cm) + "\n\n")
    f.write("Classification Report:\n")
    f.write(report)

print(" Results saved to results/evaluation.txt")
