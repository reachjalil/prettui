import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { publicPackages } from "./list-packages.mjs";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");
const provenance = !dryRun && !process.argv.includes("--no-provenance");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: process.env,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.status !== 0) {
    if (options.allowFailure) return result;
    throw new Error(`${command} ${args.join(" ")} failed.`);
  }

  return result;
}

function readPackage(dir) {
  const path = join(root, dir, "package.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function distTag(version) {
  if (typeof version !== "string" || version.length === 0) {
    throw new Error("Package version is required to select an npm dist-tag.");
  }

  const prerelease = /-(?<tag>[0-9A-Za-z-]+)/u.exec(version);
  if (prerelease?.groups?.tag) return prerelease.groups.tag;

  return "latest";
}

function packageExists(name, version) {
  const result = run("npm", ["view", `${name}@${version}`, "version"], {
    capture: true,
    allowFailure: true,
  });

  return result.status === 0 && result.stdout.trim() === version;
}

function main() {
  for (const entry of publicPackages()) {
    const dir = entry.dir;
    const pkg = readPackage(dir);
    const tag = distTag(pkg.version);

    if (packageExists(pkg.name, pkg.version)) {
      console.log(`${pkg.name}@${pkg.version} already exists on npm; skipping.`);
      continue;
    }

    const args = ["publish", "--access", "public", "--tag", tag, "--no-git-checks"];

    if (dryRun) {
      args.push("--dry-run");
    } else if (provenance) {
      args.push("--provenance");
    }

    console.log(`Publishing ${pkg.name}@${pkg.version} with npm tag ${tag}.`);
    run("pnpm", args, { cwd: join(root, dir) });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
