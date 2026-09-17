import os
import json
import whisper
from tqdm import tqdm

# Load video metadata
with open("metadata.json", "r", encoding="utf-8") as f:
    videos = json.load(f)

# Ensure transcripts folder exists
os.makedirs("transcripts", exist_ok=True)


print("Loading Whisper model (tiny)...")
model = whisper.load_model("tiny")  # Good accuracy for Hindi/English mix

for vid in tqdm(videos, desc="Transcribing"):
    video_id = vid["id"]
    
    # Check for both .webm and .mp3 formats
    audio_path_webm = f"downloads/{video_id}.webm"
    audio_path_mp3 = f"downloads/{video_id}.mp3"
    
    if os.path.exists(audio_path_webm):
        audio_path = audio_path_webm
    elif os.path.exists(audio_path_mp3):
        audio_path = audio_path_mp3
    else:
        continue

    transcript_path = f"transcripts/{video_id}.json"

    # Skip if already transcribed (allows stopping and resuming across days)
    if os.path.exists(transcript_path):
        continue

    # Transcribe audio using Whisper
    res = model.transcribe(audio_path)
    
    # Save timestamped transcript
    with open(transcript_path, "w", encoding="utf-8") as f:
        json.dump({
            "video_id": video_id,
            "title": vid["title"],
            "segments": res["segments"]
        }, f, indent=2, ensure_ascii=False)

print("\nAll audio files transcribed successfully!")