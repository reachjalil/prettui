import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readPackageJson(dir) {
  const path = join(root, dir, "package.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function publicPackages() {
  const packageRoot = join(root, "packages");
  const entries = readdirSync(packageRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `packages/${entry.name}`);
  const packages = entries.map((dir) => ({ dir, json: readPackageJson(dir) })).filter((entry) => entry.json.private !== true);
  const byName = new Map(packages.map((entry) => [entry.json.name, entry]));
  const visited = new Set();
  const sorted = [];

  function visit(entry) {
    if (visited.has(entry.json.name)) return;
    visited.add(entry.json.name);

    for (const name of Object.keys(entry.json.dependencies ?? {})) {
      const dependency = byName.get(name);
      if (dependency) visit(dependency);
    }

    sorted.push(entry);
  }

  for (const entry of packages) visit(entry);
  return sorted;
}
