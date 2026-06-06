import { describe, expect, it } from "vitest";
import { runPrettuiCli } from "@prettui/demo";
import { stripAnsi, visibleLength } from "@prettui/kit";

function runCli(args: string[]) {
  let stdout = "";
  let stderr = "";
  const code = runPrettuiCli(args, {
    stdout: {
      isTTY: false,
      columns: 120,
      rows: 32,
      write(chunk: string) {
        stdout += chunk;
      },
    },
    stderr: {
      write(chunk: string) {
        stderr += chunk;
      },
    },
    env: { NO_COLOR: "1" },
  });
  return { code, stdout, stderr };
}

describe("prettui cli", () => {
  it("prints root help", () => {
    const result = runCli(["--help"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("prettui demo");
  });

  it("prints demo help", () => {
    const result = runCli(["demo", "--help"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("--choice");
    expect(result.stdout).toContain("kitchen-sink");
  });

  it("prints a bounded default demo snapshot", () => {
    const result = runCli(["demo", "--snapshot", "--no-color", "--cols", "120", "--rows", "32"]);
    const frame = result.stdout.endsWith("\n") ? result.stdout.slice(0, -1) : result.stdout;
    const lines = frame.split("\n");

    expect(result.code).toBe(0);
    expect(lines).toHaveLength(32);
    expect(lines.every((line) => visibleLength(line) === 120)).toBe(true);
    expect(stripAnsi(frame)).toContain("Choose a TUI demo");
  });

  it("prints a kitchen sink snapshot", () => {
    const result = runCli(["demo", "--choice", "kitchen-sink", "--snapshot", "--no-color", "--cols", "178", "--rows", "48"]);
    const frame = result.stdout.endsWith("\n") ? result.stdout.slice(0, -1) : result.stdout;

    expect(result.code).toBe(0);
    expect(stripAnsi(frame)).toContain("TUI component kitchen sink");
    expect(stripAnsi(frame)).toContain("Layout Patterns");
  });

  it("rejects invalid demo choices", () => {
    const result = runCli(["demo", "--choice", "unknown"]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Invalid demo choice");
  });
});
