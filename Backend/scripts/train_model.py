import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from tqdm import tqdm
from collections import Counter
import random
import multiprocessing

def main():

    # ================== SETTINGS ==================
    DATASET_DIR = "data/dataset"
    BATCH_SIZE = 64
    NUM_EPOCHS = 8
    LEARNING_RATE = 7e-5   # 🔥 slightly reduced
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    NUM_WORKERS = 6
    IMAGE_SIZE = 224

    SAVE_MODEL_PATH = "models/deepfake_model.pth"

    torch.manual_seed(42)
    random.seed(42)

    # ================== TRANSFORMS (IMPROVED) ==================
    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(p=0.5),

        # 🔥 stronger augmentation (important for val boost)
        transforms.RandomApply([
            transforms.ColorJitter(brightness=0.1, contrast=0.1,
                                   saturation=0.1, hue=0.05)
        ], p=0.7),

        transforms.RandomRotation(8),
        transforms.RandomAffine(degrees=0, translate=(0.03, 0.03)),

        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    # ================== DATA ==================
    train_dataset = datasets.ImageFolder(
        os.path.join(DATASET_DIR, "train"),
        transform=train_transform
    )

    val_dataset = datasets.ImageFolder(
        os.path.join(DATASET_DIR, "val"),
        transform=val_transform
    )

    print("Class mapping:", train_dataset.class_to_idx)

    # ================== CLASS WEIGHTS ==================
    class_counts = Counter(train_dataset.targets)
    total = sum(class_counts.values())

    weights = torch.tensor([
        total / (2 * class_counts[train_dataset.class_to_idx["fake"]]),
        total / (2 * class_counts[train_dataset.class_to_idx["real"]])
    ], dtype=torch.float32).to(DEVICE)

    print("Class weights:", weights)

    # ================== DATALOADERS ==================
    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
        pin_memory=True,
        persistent_workers=True,
        prefetch_factor=2
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=True
    )

    # ================== MODEL ==================
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    for p in model.parameters():
        p.requires_grad = True

    model.fc = nn.Sequential(
        nn.Dropout(0.4),   # 🔥 increased dropout
        nn.Linear(model.fc.in_features, 2)
    )

    model = model.to(DEVICE)

    # ================== LOSS (IMPROVED) ==================
    criterion = nn.CrossEntropyLoss(
        weight=weights,
        label_smoothing=0.02   # 🔥 major generalization boost
    )

    # ================== OPTIMIZER (IMPROVED) ==================
    optimizer = optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE,
        weight_decay=1e-4   # 🔥 stronger regularization
    )

    # ================== SCHEDULER (BETTER THAN BEFORE) ==================
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer,
        T_max=NUM_EPOCHS
    )

    scaler = torch.amp.GradScaler(enabled=(DEVICE == "cuda"))

    # ================== TRAIN LOOP ==================
    best_val = 0.0

    for epoch in range(NUM_EPOCHS):

        model.train()
        correct, total = 0, 0

        loop = tqdm(train_loader, desc=f"Epoch {epoch+1}/{NUM_EPOCHS}")

        for images, labels in loop:
            images, labels = images.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()

            with torch.amp.autocast(device_type=DEVICE, enabled=(DEVICE == "cuda")):
                outputs = model(images)
                loss = criterion(outputs, labels)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            preds = outputs.argmax(1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

            loop.set_postfix(acc=correct / total)

        train_acc = correct / total
        print(f"\nEpoch {epoch+1} Train Acc: {train_acc:.4f}")

        # ================== VALIDATION ==================
        model.eval()
        correct, total = 0, 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)

                outputs = model(images)
                preds = outputs.argmax(1)

                correct += (preds == labels).sum().item()
                total += labels.size(0)

        val_acc = correct / total
        print(f"Validation Acc: {val_acc:.4f}")

        scheduler.step()

        if val_acc > best_val:
            best_val = val_acc
            torch.save(model.state_dict(), SAVE_MODEL_PATH)
            print(f"🏆 Saved best model: {val_acc:.4f}")

    print(f"\nBest Validation Accuracy: {best_val:.4f}")
    print(f"Model saved at: {SAVE_MODEL_PATH}")


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
