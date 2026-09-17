import os
import json
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance

# Load environment variables from root directory
load_dotenv(dotenv_path="../.env")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "chai_react_rag"

print("Loading local embedding model (all-MiniLM-L6-v2)...")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

chunks = []
transcript_files = [f for f in os.listdir("transcripts") if f.endswith(".json")]

print(f"Processing {len(transcript_files)} transcript files...")

for file in transcript_files:
    with open(f"transcripts/{file}", "r", encoding="utf-8") as f:
        data = json.load(f)

    curr_text = ""
    start_t = 0

    for seg in data["segments"]:
        if not curr_text:
            start_t = int(seg["start"])
        curr_text += " " + seg["text"]

        if seg["end"] - start_t >= 75:
            chunks.append({
                "video_id": data["video_id"],
                "title": data["title"],
                "start_time": start_t,
                "text": curr_text.strip()
            })
            curr_text = ""

print(f"Generated {len(chunks)} total text chunks.")

qclient = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

if qclient.collection_exists(collection_name=COLLECTION_NAME):
    qclient.delete_collection(collection_name=COLLECTION_NAME)

qclient.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

print("Generating embeddings and uploading to Qdrant Cloud...")
points = []
for i, chunk in enumerate(chunks):
    vector = embed_model.encode(chunk["text"]).tolist()
    points.append(PointStruct(
        id=i,
        vector=vector,
        payload=chunk
    ))

batch_size = 100
for i in range(0, len(points), batch_size):
    qclient.upsert(
        collection_name=COLLECTION_NAME,
        points=points[i:i + batch_size]
    )

print("\nAll 917 vector embeddings uploaded successfully to Qdrant!")