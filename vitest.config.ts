import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["text", "json-summary"]
    }
  },
  resolve: {
    alias: {
      "@tsa/core": `${root}packages/core/src/index.ts`,
      "@tsa/schemas": `${root}packages/schemas/src/index.ts`,
      "@tsa/shared": `${root}packages/shared/src/index.ts`,
      "@tsa/profile-module": `${root}packages/profile-module/src/index.ts`,
      "@tsa/gap-analysis-module": `${root}packages/gap-analysis-module/src/index.ts`,
      "@tsa/topic-generation-module": `${root}packages/topic-generation-module/src/index.ts`,
      "@tsa/topic-ranking-module": `${root}packages/topic-ranking-module/src/index.ts`,
      "@tsa/voting-module": `${root}packages/voting-module/src/index.ts`,
      "@tsa/content-module": `${root}packages/content-module/src/index.ts`,
      "@tsa/slide-module": `${root}packages/slide-module/src/index.ts`,
      "@tsa/scheduling-module": `${root}packages/scheduling-module/src/index.ts`,
      "@tsa/feedback-module": `${root}packages/feedback-module/src/index.ts`,
      "@tsa/evaluation-module": `${root}packages/evaluation-module/src/index.ts`,
      "@tsa/memory-module": `${root}packages/memory-module/src/index.ts`
    }
  }
});
