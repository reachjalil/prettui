import { chmodSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const sourceRoot = join(root, "src");
const outdir = join(root, "dist");

function sourceFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...sourceFiles(path));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".ts") || entry.name.endsWith(".test.ts")) {
      continue;
    }
    files.push(path);
  }

  return files;
}

rmSync(outdir, { recursive: true, force: true });

await build({
  entryPoints: sourceFiles(sourceRoot),
  outdir,
  outbase: sourceRoot,
  bundle: true,
  format: "esm",
  platform: "node",
  packages: "external",
  target: "node22",
  sourcemap: false,
  logLevel: "info",
});

for (const file of sourceFiles(sourceRoot)) {
  console.log(`built ${relative(sourceRoot, file)}`);
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const binEntries = typeof pkg.bin === "string" ? [pkg.bin] : Object.values(pkg.bin ?? {});

for (const binEntry of binEntries) {
  if (typeof binEntry !== "string") continue;
  chmodSync(join(root, binEntry), 0o755);
}
