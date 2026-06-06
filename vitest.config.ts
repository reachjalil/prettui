import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: [
      { find: "@prettui/core/ansi", replacement: fromRoot("./packages/core/src/ansi.ts") },
      { find: "@prettui/core/charts", replacement: fromRoot("./packages/core/src/charts.ts") },
      { find: "@prettui/core/layout", replacement: fromRoot("./packages/core/src/layout.ts") },
      { find: "@prettui/core", replacement: fromRoot("./packages/core/src/index.ts") },
      { find: "@prettui/components", replacement: fromRoot("./packages/components/src/index.ts") },
      { find: "@prettui/dashboard", replacement: fromRoot("./packages/dashboard/src/index.ts") },
      { find: "@prettui/demo", replacement: fromRoot("./packages/demo/src/index.ts") },
      { find: "@prettui/framework", replacement: fromRoot("./packages/framework/src/index.ts") },
      { find: "@prettui/layouts", replacement: fromRoot("./packages/layouts/src/index.ts") },
      { find: "@prettui/kit", replacement: fromRoot("./packages/kit/src/index.ts") },
    ],
  },
});
