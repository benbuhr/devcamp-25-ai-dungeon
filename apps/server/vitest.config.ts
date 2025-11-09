import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: [],
    coverage: {
      reporter: ["text", "lcov"],
      all: false
    }
  },
  resolve: {
    alias: {
      "@ashen/shared": path.resolve(__dirname, "../../packages/shared/src")
    }
  }
});

