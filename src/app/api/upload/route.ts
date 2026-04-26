import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

// Token broker for client-direct uploads to Vercel Blob.
// The browser calls @vercel/blob/client::upload(), which round-trips through
// this endpoint to get a one-shot upload token, then uploads bytes directly
// to Vercel Blob storage (bypasses the 4.5MB serverless body limit).
//
// Requires BLOB_READ_WRITE_TOKEN — set automatically when you enable Vercel
// Blob on the project.
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Vercel Blob is not enabled. Add BLOB_READ_WRITE_TOKEN or enable Blob storage on the Vercel project." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Auth is optional — when accounts aren't configured, anyone can upload.
        const session = await auth().catch(() => null);
        return {
          allowedContentTypes: ["video/mp4", "image/png", "image/jpeg", "audio/mpeg"],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB
          tokenPayload: JSON.stringify({ userId: session?.user?.id || "anon" }),
        };
      },
      onUploadCompleted: async () => {
        // No-op. We persist the DB row from /api/videos/save.
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
