import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.astro/**",
      // Generated client exports (npm run export); verified separately by export:verify.
      "exports/**",
      // Logo design mockup exported from a design tool (vendored React runtime); reference material, not code.
      "Hn*-html/**",
    ],
  },
  tseslint.configs.recommended,
  {
    rules: {
      // House style: conditions are always written out as full blocks.
      curly: ["error", "all"],
      "brace-style": ["error", "1tbs"],
      "no-nested-ternary": "error",
      "no-unused-expressions": ["error", { allowShortCircuit: false, allowTernary: false }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: { "@typescript-eslint/triple-slash-reference": "off" },
  },
);
