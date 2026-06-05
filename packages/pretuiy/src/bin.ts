#!/usr/bin/env node
import { runPretuiyCli } from "./demo/cli";

try {
  const result = runPretuiyCli(process.argv.slice(2));
  if (typeof result === "number") {
    process.exitCode = result;
  }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
