import cv2
import os

# 📌 Path to input videos
video_folder = "C:/Users/DELL/Desktop/Deepfake_App/backend/data_v2/raw_videos"
# 📌 Path to save frames
frames_folder = "C:/Users/DELL/Desktop/Deepfake_App/backend/data_v2/processed_frames"

# ✅ Create main frames folder if it doesn't exist
os.makedirs(frames_folder, exist_ok=True)

# 🔥 SETTINGS
MAX_FRAMES = 15
RESIZE_DIM = (224, 224)  # 🔧 fixed to match model input

# Loop through real and fake subfolders
for label in ["real", "fake"]:
    label_folder = os.path.join(video_folder, label)
    output_label_folder = os.path.join(frames_folder, label)
    os.makedirs(output_label_folder, exist_ok=True)

    # 🔥 SORTED for consistency
    for video_file in sorted(os.listdir(label_folder)):
        if video_file.endswith((".mp4", ".avi")):
            video_path = os.path.join(label_folder, video_file)
            cap = cv2.VideoCapture(video_path)

            # 🔥 Skip corrupted/unreadable videos
            if not cap.isOpened():
                print(f"⚠️ Skipping corrupted video: {video_file}")
                continue

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            if total_frames == 0:
                print(f"⚠️ Skipping empty video: {video_file}")
                cap.release()
                continue

            # 🔥 Uniform sampling: pick evenly spaced frame indices
            num_samples = min(MAX_FRAMES, total_frames)
            sample_indices = set(
                int(i * total_frames / num_samples) for i in range(num_samples)
            )

            frame_count = 0
            saved_count = 0

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_count in sample_indices:
                    # 🔥 Resize before saving
                    frame = cv2.resize(frame, RESIZE_DIM)
                    frame_name = f"{os.path.splitext(video_file)[0]}_frame{saved_count}.jpg"
                    save_path = os.path.join(output_label_folder, frame_name)
                    cv2.imwrite(save_path, frame)
                    saved_count += 1

                frame_count += 1

            cap.release()
            print(f"{video_file}: {saved_count} frames extracted")

print("✅ Frame extraction complete.")