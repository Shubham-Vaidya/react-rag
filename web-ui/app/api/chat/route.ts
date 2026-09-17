import { NextRequest, NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";
import Groq from "groq-sdk";
import { pipeline } from "@xenova/transformers";

const qclient = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

type EmbeddingExtractor = (
    query: string,
    options: { pooling: "mean"; normalize: true },
) => Promise<{ data: Float32Array }>;

type SearchPayload = {
    video_id?: string;
    title?: string;
    start_time?: number;
    text?: string;
};

let extractor: EmbeddingExtractor | null = null;

async function getExtractor(): Promise<EmbeddingExtractor> {
    if (!extractor) {
        extractor = (await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")) as EmbeddingExtractor;
    }
    return extractor;
}

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // 1. Generate 384-dim vector embedding locally
        const generateEmbedding = await getExtractor();
        const output = await generateEmbedding(query, {
            pooling: "mean",
            normalize: true,
        });
        const queryVector: number[] = Array.from(output.data as Float32Array);

        // 2. Query Qdrant vector database
        const { points: searchResults } = await qclient.query("chai_react_rag", {
            query: queryVector,
            limit: 3,
            with_payload: true,
        });

        if (!searchResults || searchResults.length === 0) {
            return NextResponse.json({
                answer: "No relevant content found in the video transcripts for this query.",
                sources: [],
            });
        }

        // Safely extract context string with fallback values
        const context = searchResults
            .map((res) => {
                const payload = (res.payload || {}) as SearchPayload;
                const title = payload.title || "Chai aur React Video";
                const startTime = payload.start_time ?? 0;
                const text = payload.text || "";
                return `[Video: ${title} | Timestamp: ${startTime}s]\n${text}`;
            })
            .join("\n\n");

        // 3. Synthesize answer with Groq LLM
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert AI teaching assistant for Hitesh Choudhary's 'Chai aur React' YouTube series. Answer user queries strictly based on the provided context. Always reference video titles and timestamps.",
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nQuestion: ${query}`,
                },
            ],
        });

        // Safely structure source chips for UI
        const sources = searchResults.map((r) => {
            const payload = (r.payload || {}) as SearchPayload;
            return {
                video_id: payload.video_id || "",
                title: payload.title || "Chai aur React Video",
                start_time: payload.start_time ?? 0,
                text: payload.text || "",
            };
        });

        return NextResponse.json({
            answer: completion.choices[0].message.content,
            sources,
        });
    } catch (error: unknown) {
        console.error("API Error Details:", error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}