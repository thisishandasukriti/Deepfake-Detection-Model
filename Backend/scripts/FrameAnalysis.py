import os
import cv2
import numpy as np
import shutil
from collections import defaultdict
from tqdm import tqdm

# ================= SETTINGS =================
DATASET_DIR = r"\filtered_fake"
DUP_DIR = r"\HARD_DUPLICATES"

FRAME_SAMPLES = 8
SIM_THRESHOLD = 0.92

SIZE_TOL = 0.01       # 1%
DUR_TOL = 2.0         # seconds
# ============================================


def parse_filename(filename):
    name = filename.replace(".mp4", "")
    parts = name.split("__")

    pair = parts[0]
    scenario = parts[1]

    return pair, scenario


def get_video_duration(path):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    cap.release()

    if fps == 0:
        return 0
    return frames / fps


def extract_key_frames(video_path, num_frames=FRAME_SAMPLES):
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    frames = []
    if total_frames == 0:
        return frames

    indices = np.linspace(0, total_frames - 1, num_frames).astype(int)

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, (64, 64))
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frames.append(frame)

    cap.release()
    return frames


def compute_similarity(frames1, frames2):
    min_len = min(len(frames1), len(frames2))
    if min_len == 0:
        return 0

    score = 0
    for i in range(min_len):
        diff = np.mean((frames1[i] - frames2[i]) ** 2)
        score += diff

    score /= min_len
    similarity = 1 / (1 + score)
    return similarity


def main():
    os.makedirs(DUP_DIR, exist_ok=True)

    videos = [f for f in os.listdir(DATASET_DIR) if f.endswith(".mp4")]

    # Group videos
    groups = defaultdict(list)
    for v in videos:
        pair, scenario = parse_filename(v)
        groups[(pair, scenario)].append(v)

    moved = 0

    for key, vids in groups.items():

        # ================= SKIP 1 VIDEO =================
        if len(vids) == 1:
            continue

        # ================= HANDLE 2 VIDEOS (FAST) =================
        if len(vids) == 2:
            v1, v2 = vids

            path1 = os.path.join(DATASET_DIR, v1)
            path2 = os.path.join(DATASET_DIR, v2)

            size1 = os.path.getsize(path1)
            size2 = os.path.getsize(path2)

            dur1 = get_video_duration(path1)
            dur2 = get_video_duration(path2)

            size_close = abs(size1 - size2) / max(size1, size2) < SIZE_TOL
            dur_close = abs(dur1 - dur2) < DUR_TOL

            if size_close and dur_close:
                shutil.move(path2, os.path.join(DUP_DIR, v2))
                moved += 1

            continue

        # ================= PROCESS LARGE GROUPS =================
        print(f"\n Checking group: {key} ({len(vids)} videos)")

        features = []  # (filename, size, duration, frames)

        for v in tqdm(vids):
            path = os.path.join(DATASET_DIR, v)

            size = os.path.getsize(path)
            duration = get_video_duration(path)

            is_duplicate = False

            for s_file, s_size, s_dur, s_frames in features:

                #  FAST FILTER (skip heavy work)
                size_close = abs(size - s_size) / max(size, s_size) < SIZE_TOL
                dur_close = abs(duration - s_dur) < DUR_TOL

                if not (size_close and dur_close):
                    continue

                #  Only now extract frames
                frames = extract_key_frames(path)

                sim = compute_similarity(frames, s_frames)

                if sim > SIM_THRESHOLD:
                    is_duplicate = True
                    break

            if not is_duplicate:
                # extract frames ONLY ONCE
                frames = extract_key_frames(path)
                features.append((v, size, duration, frames))
            else:
                shutil.move(path, os.path.join(DUP_DIR, v))
                moved += 1

    print("\n================ RESULT ================")
    print(f" Hard duplicates moved: {moved}")


if __name__ == "__main__":
    main()
