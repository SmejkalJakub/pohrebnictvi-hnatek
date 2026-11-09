import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["core/tests/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "templates",
          include: ["templates/*/tests/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "tools",
          include: ["tools/**/tests/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "harness",
          include: ["harness/tests/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
