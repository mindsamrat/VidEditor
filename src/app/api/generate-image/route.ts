import { NextRequest, NextResponse } from "next/server";

function generatePlaceholderSvg(
  prompt: string,
  aspectRatio: string
): string {
  // Generate a deterministic color from the prompt
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const bgColor = `hsl(${hue}, 40%, 15%)`;
  const accentColor = `hsl(${hue}, 60%, 45%)`;
  const highlightColor = `hsl(${(hue + 30) % 360}, 50%, 60%)`;

  let width = 1280;
  let height = 720;
  if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  } else if (aspectRatio === "1:1") {
    width = 1080;
    height = 1080;
  }

  // Truncate prompt for display
  const displayText = prompt.length > 120 ? prompt.slice(0, 120) + "..." : prompt;
  const lines = wrapText(displayText, aspectRatio === "9:16" ? 30 : 50);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor}"/>
        <stop offset="100%" style="stop-color:#0A0A0F"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.3"/>
        <stop offset="100%" style="stop-color:transparent;stop-opacity:0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#glow)"/>
    <circle cx="${width * 0.3}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.15}" fill="${accentColor}" opacity="0.1"/>
    <circle cx="${width * 0.7}" cy="${height * 0.6}" r="${Math.min(width, height) * 0.1}" fill="${highlightColor}" opacity="0.08"/>
    <rect x="${width * 0.1}" y="${height * 0.4}" width="${width * 0.8}" height="1" fill="${accentColor}" opacity="0.2"/>
    <text x="${width / 2}" y="${height * 0.15}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(width * 0.02)}" fill="${highlightColor}" opacity="0.6" letter-spacing="4">AI IMAGE PLACEHOLDER</text>
    ${lines.map((line, i) => `<text x="${width / 2}" y="${height * 0.45 + i * Math.round(width * 0.028)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(width * 0.018)}" fill="#888" font-style="italic">${escapeXml(line)}</text>`).join("\n    ")}
    <text x="${width / 2}" y="${height * 0.88}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(width * 0.014)}" fill="#555">Set REPLICATE_API_TOKEN for real AI images</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 6); // max 6 lines
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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
    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      console.log("No REPLICATE_API_TOKEN set — using placeholder image");
      const imageUrl = generatePlaceholderSvg(prompt, ar);
      return NextResponse.json({
        imageUrl,
        seed: Math.floor(Math.random() * 1000000),
        placeholder: true,
      });
    }

    // Use Replicate API
    const { default: Replicate } = await import("replicate");
    const replicate = new Replicate({ auth: apiToken });

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
