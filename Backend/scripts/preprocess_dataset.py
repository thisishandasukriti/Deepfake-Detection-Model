
"""
scripts/preprocess_dataset.py

Runs:
 - filter tiny faces
 - resize images (default 224x224)
 - split dataset by video id into train/val/test (video-level split)
 - saves processed images to data/dataset/{train,val,test}/{real,fake}
 - writes data/dataset/mapping.csv with file, label, split, orig_path
"""

import os
import random
import csv
from collections import defaultdict
import cv2
import time
import concurrent.futures
from multiprocessing import freeze_support, cpu_count

# ==== USER ADJUSTABLE PARAMETERS ====
CROPPED_FOLDER = "C:/Users/DELL/Desktop/Deepfake_App/backend/data_v2/cropped_faces"
OUTPUT_DATASET = "C:/Users/DELL/Desktop/Deepfake_App/backend/data_v2/dataset"
TARGET_SIZE = (224, 224)
MIN_FACE_SIZE = 30
SPLIT = (0.80, 0.10, 0.10)
RANDOM_SEED = 42
NUM_WORKERS = max(1, cpu_count() - 2)
PROGRESS_EVERY = 100
# ===================================

assert abs(sum(SPLIT) - 1.0) < 1e-6, "SPLIT must sum to 1.0"
random.seed(RANDOM_SEED)

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def video_id_from_filename(fname):
    base = os.path.splitext(fname)[0]

    # remove label prefix (real_ / fake_)
    if base.startswith("real_") or base.startswith("fake_"):
        base = base.split("_", 1)[1]

    # remove frame number
    if "_frame" in base:
        base = base.split("_frame")[0]

    return base

def process_one(task):
    src_path, label, split_name = task
    img = cv2.imread(src_path)
    if img is None:
        return None, "read_error", src_path, split_name

    h, w = img.shape[:2]
    if h < MIN_FACE_SIZE or w < MIN_FACE_SIZE:
        return None, "too_small", src_path, split_name

    resized = cv2.resize(img, TARGET_SIZE, interpolation=cv2.INTER_AREA)

    dst_dir = os.path.join(OUTPUT_DATASET, split_name, label)
    dst_path = os.path.join(dst_dir, os.path.basename(src_path))
    cv2.imwrite(dst_path, resized, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    return dst_path, None, src_path, split_name

def gather_tasks():
    by_video = {"real": defaultdict(list), "fake": defaultdict(list)}
    for label in ("real", "fake"):
        folder = os.path.join(CROPPED_FOLDER, label)
        if not os.path.isdir(folder):
            raise FileNotFoundError(f"Missing folder: {folder}")
        for fname in sorted(os.listdir(folder)):
            if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            vid = video_id_from_filename(fname)
            by_video[label][vid].append(os.path.join(folder, fname))

    splits = {"train": {"real": [], "fake": []},
              "val":   {"real": [], "fake": []},
              "test":  {"real": [], "fake": []}}


    def split_video_ids(video_ids, split_ratios):
        random.shuffle(video_ids)
        n = len(video_ids)
        n_train = int(split_ratios[0] * n)
        n_val = int(split_ratios[1] * n)
        train_ids = video_ids[:n_train]
        val_ids = video_ids[n_train:n_train + n_val]
        test_ids = video_ids[n_train + n_val:]
        return train_ids, val_ids, test_ids

    # 🔥 Combine ALL video IDs (real + fake)
    all_video_ids = set()

    for label in ("real", "fake"):
        all_video_ids.update(by_video[label].keys())

    all_video_ids = list(all_video_ids)
    random.shuffle(all_video_ids)

    # Split once
    n = len(all_video_ids)
    n_train = int(SPLIT[0] * n)
    n_val = int(SPLIT[1] * n)

    train_ids = set(all_video_ids[:n_train])
    val_ids = set(all_video_ids[n_train:n_train + n_val])
    test_ids = set(all_video_ids[n_train + n_val:])

    tasks = []

    for label in ("real", "fake"):
        for vid, paths in by_video[label].items():

            if vid in train_ids:
                split_name = "train"
            elif vid in val_ids:
                split_name = "val"
            else:
                split_name = "test"

            for src_path in paths:
                tasks.append((src_path, label, split_name))
    return tasks



if __name__ == "__main__":
    freeze_support()
    start_time = time.time()

    tasks = gather_tasks()
    total_in = len(tasks)
    print(f"📌 Total images to process: {total_in}")
    print("Total Tasks:", len(tasks))
    print(f"🧠 Using {NUM_WORKERS} parallel workers...\n")

    # 🔥 Pre-create all output directories before parallel loop
    for split_name in ("train", "val", "test"):
        for label in ("real", "fake"):
            ensure_dir(os.path.join(OUTPUT_DATASET, split_name, label))

    mapping_rows = []
    total_out = 0
    skipped_small = 0
    skipped_error = 0

    with concurrent.futures.ProcessPoolExecutor(max_workers=NUM_WORKERS) as executor:
        for i, result in enumerate(executor.map(process_one, tasks), 1):
            dst_path, err, src_path, split_name = result
            if err == "too_small":
                skipped_small += 1
            elif err == "read_error":
                skipped_error += 1
            elif dst_path is not None:
                total_out += 1
                label = os.path.basename(os.path.dirname(src_path))
                # 🔥 Fixed mapping CSV: correct label and split recorded
                mapping_rows.append([dst_path, label, split_name, src_path])

            if i % PROGRESS_EVERY == 0 or i == total_in:
                elapsed = time.time() - start_time
                fps = i / elapsed
                remaining = (total_in - i) / fps if fps > 0 else 0
                print(f"[{i}/{total_in}] {i/total_in:.1%} done | {fps:.2f} img/sec | ETA: {remaining/60:.1f} min")

    # ---------- Write mapping CSV ----------
    mapping_csv_path = os.path.join(OUTPUT_DATASET, "mapping.csv")
    ensure_dir(OUTPUT_DATASET)
    with open(mapping_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["saved_path", "label", "split", "orig_path"])
        for row in mapping_rows:
            writer.writerow(row)

    print("\n----- PREPROCESSING SUMMARY -----")
    print(f"Total images found:          {total_in}")
    print(f"Total images saved:          {total_out}")
    print(f"Skipped (too small):         {skipped_small}")
    print(f"Skipped (read error):        {skipped_error}")
    print(f"Mapping CSV written to:      {mapping_csv_path}")
    print(f"⏰ Total time: {(time.time() - start_time)/60:.2f} minutes")
    print("✅ Preprocessing complete!")
