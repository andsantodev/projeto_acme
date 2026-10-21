import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "error",
    },
  },
  {
    // Verification scripts report their result on stdout.
    files: ["scripts/**/*.{js,mjs,ts}"],
    rules: { "no-console": "off" },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local artifacts: design-skill output and coverage.
    ".taste-skill/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
