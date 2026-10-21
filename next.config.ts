import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Managed agent instructions would write a block into AGENTS.md, which is the
  // canonical harness file of this project.
  agentRules: false,

  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
