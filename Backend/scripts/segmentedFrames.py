import cv2
import os
import random

random.seed(42)

video_folder = "/backend/data_v2/raw_videos"
frames_folder = "/backend/data_v2/processed_frames"

os.makedirs(frames_folder, exist_ok=True)

RESIZE_DIM = (224, 224)

def get_video_duration(cap):
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    if fps == 0:
        return 0
    return total_frames / fps


def get_extraction_params(duration):
    """
    Returns (total_frames_to_extract, num_segments)
    based on duration
    """

    if duration < 10:
        return 20, 4   # very short videos
    elif duration < 45:
        return 36, 6   # medium videos
    else:
        return 50, 10  # long videos


for label in ["real"]:
    label_folder = os.path.join(video_folder, label)
    output_label_folder = os.path.join(frames_folder, label)
    os.makedirs(output_label_folder, exist_ok=True)

    for video_file in sorted(os.listdir(label_folder)):
        if not video_file.endswith((".mp4", ".avi")):
            continue

        video_path = os.path.join(label_folder, video_file)
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            print(f" Skipping corrupted video: {video_file}")
            continue

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames == 0:
            print(f" Skipping empty video: {video_file}")
            cap.release()
            continue

        duration = get_video_duration(cap)

        #  Adaptive parameters
        MAX_FRAMES, NUM_SEGMENTS = get_extraction_params(duration)
        FRAMES_PER_SEGMENT = max(1, MAX_FRAMES // NUM_SEGMENTS)

        segment_size = total_frames // NUM_SEGMENTS

        selected_indices = []

        #  Segment-based sampling
        for seg in range(NUM_SEGMENTS):
            start = seg * segment_size
            end = start + segment_size - 1

            if end <= start:
                continue

            available = end - start

            # avoid sampling more than available frames
            num_samples = min(FRAMES_PER_SEGMENT, available)

            segment_indices = random.sample(range(start, end), num_samples)

            selected_indices.extend(segment_indices)

        selected_indices = sorted(set(selected_indices))

        frame_count = 0
        saved_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count in selected_indices:
                frame = cv2.resize(frame, RESIZE_DIM)

                frame_name = f"{os.path.splitext(video_file)[0]}_frame{saved_count}.jpg"
                save_path = os.path.join(output_label_folder, frame_name)

                cv2.imwrite(save_path, frame)
                saved_count += 1

            frame_count += 1

        cap.release()

        print(f"{video_file}: {saved_count} frames extracted (duration: {round(duration,2)}s)")

print(" Frame extraction complete.")
