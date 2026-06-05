import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: [
      { find: "pretuiy/framework", replacement: fileURLToPath(new URL("./src/framework/index.ts", import.meta.url)) },
      { find: "pretuiy", replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)) },
    ],
  },
  test: {
    environment: "node",
    include: ["test/**/*.{test,spec}.ts"],
  },
});
