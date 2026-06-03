import os
import cv2
import shutil
from collections import defaultdict

# ================= SETTINGS =================
DATASET_DIR = r"D:\DATASET FOR DFD\fake"
UNIQUE_DIR = r"D:\DATASET FOR DFD\filtered_fake"
DUPLICATE_DIR = r"D:\DATASET FOR DFD\DFD_DUPLICATES"

DURATION_TOL = 1.0        # seconds
SIZE_TOL_RATIO = 0.01     # 1%
# ============================================


def parse_filename(filename):
    """
    Example:
    27_25__walking_and_outside_surprised__GNIMW95Z.mp4
    """
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


def is_similar(size1, size2, dur1, dur2):
    size_close = abs(size1 - size2) / max(size1, size2) < SIZE_TOL_RATIO
    dur_close = abs(dur1 - dur2) < DURATION_TOL
    return size_close and dur_close


def main():
    os.makedirs(UNIQUE_DIR, exist_ok=True)
    os.makedirs(DUPLICATE_DIR, exist_ok=True)

    video_files = [
        f for f in os.listdir(DATASET_DIR) if f.endswith(".mp4")
    ]

    print(f"📦 Total videos: {len(video_files)}")

    # Step 1: Group by (pair, scenario)
    groups = defaultdict(list)

    for file in video_files:
        pair, scenario = parse_filename(file)
        groups[(pair, scenario)].append(file)

    kept = 0
    moved = 0

    for key, files in groups.items():
        print(f"\n🔍 Processing group: {key} ({len(files)} videos)")

        selected = []

        for file in files:
            path = os.path.join(DATASET_DIR, file)

            size = os.path.getsize(path)
            duration = get_video_duration(path)

            duplicate = False

            for s_file, s_size, s_dur in selected:
                if is_similar(size, s_size, duration, s_dur):
                    duplicate = True
                    break

            src = path

            if not duplicate:
                dst = os.path.join(UNIQUE_DIR, file)
                shutil.copy(src, dst)
                selected.append((file, size, duration))
                kept += 1
            else:
                dst = os.path.join(DUPLICATE_DIR, file)
                shutil.move(src, dst)   # <-- MOVE instead of delete
                moved += 1

    print("\n================ RESULT ================")
    print(f"✔ Unique kept: {kept}")
    print(f"📦 Moved to DFD_DUPLICATES: {moved}")


if __name__ == "__main__":
    main()