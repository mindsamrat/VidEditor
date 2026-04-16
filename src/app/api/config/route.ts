import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const ENV_PATH = join(process.cwd(), ".env.local");

async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const content = await readFile(ENV_PATH, "utf-8");
    const vars: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
      }
    }
    return vars;
  } catch {
    return {};
  }
}

export async function GET() {
  const vars = await readEnvFile();
  return NextResponse.json({
    hasAnthropicKey: !!vars.ANTHROPIC_API_KEY || !!process.env.ANTHROPIC_API_KEY,
    hasReplicateToken: !!vars.REPLICATE_API_TOKEN || !!process.env.REPLICATE_API_TOKEN,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { anthropicKey, replicateToken } = await request.json();
    const existing = await readEnvFile();

    if (anthropicKey !== undefined) {
      existing.ANTHROPIC_API_KEY = anthropicKey;
    }
    if (replicateToken !== undefined) {
      existing.REPLICATE_API_TOKEN = replicateToken;
    }

    const content = Object.entries(existing)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") + "\n";

    await writeFile(ENV_PATH, content, "utf-8");

    return NextResponse.json({
      success: true,
      message: "API keys saved. Restart the dev server for changes to take effect.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
