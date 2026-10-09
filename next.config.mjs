/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // The AI desk reads the yt-* SKILL.md files at runtime as its system prompts.
    outputFileTracingIncludes: {
      "/api/assist": ["./.claude/skills/**/SKILL.md"],
    },
  },
  images: {
    // YouTube already serves thumbnails sized and compressed; skip the optimizer.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
