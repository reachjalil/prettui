#!/usr/bin/env node
import { runPrettuiCli } from "@prettui/demo";

try {
  const result = runPrettuiCli(process.argv.slice(2));
  if (typeof result === "number") {
    process.exitCode = result;
  }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
