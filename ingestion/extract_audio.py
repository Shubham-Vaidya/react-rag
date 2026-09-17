import yt_dlp
import json
import os

# Chai aur React Playlist URL
PLAYLIST_URL = "https://www.youtube.com/watch?v=vz1RlUyrc3w&list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige"

# Create downloads directory if it doesn't exist
os.makedirs("downloads", exist_ok=True)

ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': 'downloads/%(id)s.%(ext)s',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'ignoreerrors': True
}

print("Fetching metadata and downloading audio files...")
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(PLAYLIST_URL, download=True)

videos = []
if 'entries' in info:
    for entry in info['entries']:
        if entry:
            videos.append({
                "id": entry['id'],
                "title": entry['title']
            })

with open("metadata.json", "w", encoding="utf-8") as f:
    json.dump(videos, f, indent=2, ensure_ascii=False)

print(f"\nDone! Downloaded {len(videos)} audio files and created metadata.json.")