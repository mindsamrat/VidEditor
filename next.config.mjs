/** @type {import('next').NextConfig} */
const nextConfig = {
  // The /studio page uses ffmpeg.wasm to compose the final MP4 in-browser.
  // ffmpeg.wasm needs SharedArrayBuffer, which requires these isolation headers
  // on every cross-origin response that the page can read.
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "*.replicate.delivery" },
    ],
  },
};

export default nextConfig;
