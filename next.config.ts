import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Managed agent instructions would write a block into AGENTS.md, which is the
  // canonical harness file of this project.
  agentRules: false,

  // The upload form accepts up to 10 files of 200 KB each; the default 1 MB
  // Server Action body limit would reject the largest allowed submission.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
