import cv2
import os
import numpy as np

# 📌 Path to input videos
video_folder = r"D:\DATASET FOR DFD\filtered_fake"
# 📌 Path to save frames
frames_folder = "C:/Users/DELL/Desktop/Deepfake_App/backend/data_v2/processed_frames"

os.makedirs(frames_folder, exist_ok=True)

# 🔥 SETTINGS (UPDATED)
MAX_FRAMES = 8   # ✅ changed from 15 → 8
RESIZE_DIM = (224, 224)

def get_video_duration(cap):
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    if fps == 0:
        return 0
    return frames / fps


for label in ["fake"]:
    label_folder = os.path.join(video_folder, label)
    output_label_folder = os.path.join(frames_folder, label)
    os.makedirs(output_label_folder, exist_ok=True)

    for video_file in sorted(os.listdir(label_folder)):
        if not video_file.endswith((".mp4", ".avi")):
            continue

        video_path = os.path.join(label_folder, video_file)
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            print(f"⚠️ Skipping corrupted video: {video_file}")
            continue

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames == 0:
            print(f"⚠️ Skipping empty video: {video_file}")
            cap.release()
            continue

        duration = get_video_duration(cap)

        # 🔥 Optional: adjust for very short videos
        if duration < 5:
            num_samples = min(5, total_frames)
        else:
            num_samples = min(MAX_FRAMES, total_frames)

        # ✅ EVENLY SPACED (better than previous formula)
        sample_indices = np.linspace(0, total_frames - 1, num_samples).astype(int)

        frame_count = 0
        saved_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count in sample_indices:
                frame = cv2.resize(frame, RESIZE_DIM)

                frame_name = f"{os.path.splitext(video_file)[0]}_frame{saved_count}.jpg"
                save_path = os.path.join(output_label_folder, frame_name)

                cv2.imwrite(save_path, frame)
                saved_count += 1

            frame_count += 1

        cap.release()
        print(f"{video_file}: {saved_count} frames extracted (duration: {round(duration,2)}s)")

print("✅ Frame extraction complete.")