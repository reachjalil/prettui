export type Rgb = readonly [number, number, number];

export const theme = {
  bg: [2, 7, 8] as Rgb,
  text: [235, 226, 211] as Rgb,
  muted: [142, 132, 122] as Rgb,
  border: [96, 101, 100] as Rgb,
  grid: [35, 48, 47] as Rgb,
  green: [55, 214, 123] as Rgb,
  red: [255, 97, 89] as Rgb,
  amber: [246, 199, 75] as Rgb,
  cyan: [55, 221, 201] as Rgb,
  blue: [79, 190, 245] as Rgb,
  purple: [184, 128, 255] as Rgb,
  slate: [154, 164, 177] as Rgb,
  lime: [128, 220, 78] as Rgb,
  white: [255, 247, 224] as Rgb,
} as const;

export type Tone = "green" | "red" | "amber" | "cyan" | "blue" | "purple" | "slate" | "lime" | "white";

const ansiPattern = /\x1b\[[0-9;]*m/g;

function charWidth(char: string): number {
  const code = char.codePointAt(0) ?? 0;
  if (code === 0 || code === 0x200d) return 0;
  if (code < 32 || (code >= 0x7f && code < 0xa0)) return 0;
  if ((code >= 0x0300 && code <= 0x036f) || (code >= 0xfe00 && code <= 0xfe0f)) return 0;
  if (
    code >= 0x1100 &&
    (code <= 0x115f ||
      code === 0x2329 ||
      code === 0x232a ||
      (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1f300 && code <= 0x1faff) ||
      (code >= 0x20000 && code <= 0x3fffd))
  ) {
    return 2;
  }
  return 1;
}

export function color(text: unknown, code: string, enabled = true): string {
  return enabled ? `\x1b[${code}m${String(text)}\x1b[0m` : String(text);
}

export function rgb(text: unknown, [r, g, b]: Rgb, enabled = true): string {
  return color(text, `38;2;${r};${g};${b}`, enabled);
}

export function bgRgb(text: unknown, [r, g, b]: Rgb, enabled = true): string {
  return color(text, `48;2;${r};${g};${b}`, enabled);
}

export function bold(text: unknown, enabled = true): string {
  return color(text, "1", enabled);
}

export function dim(text: unknown, enabled = true): string {
  return color(text, "2", enabled);
}

export function stripAnsi(text: unknown): string {
  return String(text ?? "").replace(ansiPattern, "");
}

export function visibleLength(text: unknown): number {
  return Array.from(stripAnsi(text)).reduce((sum, char) => sum + charWidth(char), 0);
}

export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
}

function takeVisible(text: string, width: number): string {
  if (width <= 0) return "";
  let output = "";
  let visible = 0;

  for (let index = 0; index < text.length && visible < width; ) {
    if (text[index] === "\x1b") {
      const match = text.slice(index).match(/^\x1b\[[0-9;]*m/);
      if (match) {
        output += match[0];
        index += match[0].length;
        continue;
      }
    }

    const char = Array.from(text.slice(index))[0] ?? "";
    const widthForChar = charWidth(char);
    if (visible + widthForChar > width) break;
    output += char;
    visible += widthForChar;
    index += char.length;
  }

  return output;
}

export function truncate(text: unknown, width: number): string {
  const value = String(text ?? "");
  if (width <= 0) return "";
  if (visibleLength(value) <= width) return value;
  if (width <= 3) return takeVisible(value, width);
  return `${takeVisible(value, width - 3)}...${value.includes("\x1b[") ? "\x1b[0m" : ""}`;
}

export function padAnsi(text: unknown, width: number): string {
  const value = String(text ?? "");
  const remaining = width - visibleLength(value);
  return remaining > 0 ? `${value}${" ".repeat(remaining)}` : value;
}

export function fitAnsi(text: unknown, width: number): string {
  return padAnsi(truncate(text, width), width);
}

export function left(text: unknown, width: number): string {
  return fitAnsi(text, width);
}

export function right(text: unknown, width: number): string {
  const value = truncate(text, width);
  return `${" ".repeat(Math.max(0, width - visibleLength(value)))}${value}`;
}

export function joinAligned(leftText: string, rightText: string, width: number, minGap = 2): string {
  const leftWidth = visibleLength(leftText);
  const rightWidth = visibleLength(rightText);
  if (leftWidth + minGap + rightWidth <= width) {
    return `${leftText}${" ".repeat(width - leftWidth - rightWidth)}${rightText}`;
  }
  if (rightWidth + minGap >= width) return truncate(rightText, width);
  return `${truncate(leftText, width - rightWidth - minGap)}${" ".repeat(minGap)}${rightText}`;
}

export function repeatToWidth(value: string, width: number): string {
  if (width <= 0) return "";
  let output = "";
  while (visibleLength(output) < width) output += value;
  return takeVisible(output, width);
}

export function selectedLine(line: string, width: number, enabled = true): string {
  const fitted = fitAnsi(stripAnsi(line), width);
  return enabled ? bgRgb(bold(fitted, true), [10, 61, 43], true) : fitted;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}
