import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate();

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Image prompt is required" },
        { status: 400 }
      );
    }

    const ar = aspectRatio || "16:9";

    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt,
        aspect_ratio: ar,
        num_outputs: 1,
        output_format: "webp",
        output_quality: 90,
      },
    });

    const results = output as unknown[];
    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    // Replicate returns ReadableStream objects - we need to consume them
    const firstResult = results[0];
    let imageUrl: string;

    if (firstResult instanceof ReadableStream) {
      const reader = firstResult.getReader();
      const chunks: Uint8Array[] = [];
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) chunks.push(result.value);
      }
      const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      const base64 = Buffer.from(combined).toString("base64");
      imageUrl = `data:image/webp;base64,${base64}`;
    } else if (typeof firstResult === "string") {
      imageUrl = firstResult;
    } else {
      imageUrl = String(firstResult);
    }

    return NextResponse.json({
      imageUrl,
      seed: Math.floor(Math.random() * 1000000),
    });
  } catch (error: unknown) {
    console.error("Image generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
