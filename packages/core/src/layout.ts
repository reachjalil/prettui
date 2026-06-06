import { bold, clamp, fitAnsi, joinAligned, repeatToWidth, rgb, theme, truncate, visibleLength, type Rgb } from "./ansi";

export interface BoxOptions {
  width: number;
  height?: number;
  accent?: Rgb;
  color?: boolean;
  paddingX?: number;
  titleAlign?: "left" | "center";
}

export function splitWidths(total: number, count: number, gap = 1, minimum = 1): number[] {
  const available = Math.max(count * minimum, total - gap * Math.max(0, count - 1));
  const base = Math.floor(available / count);
  let remainder = available - base * count;
  return Array.from({ length: count }, () => base + (remainder-- > 0 ? 1 : 0));
}

export function splitRatioWidths(total: number, ratios: number[], gap = 1, minimums: number[] = []): number[] {
  const available = Math.max(ratios.length, total - gap * Math.max(0, ratios.length - 1));
  const minimumTotal = minimums.reduce((sum, value) => sum + value, 0);
  const activeMinimums = minimumTotal <= available ? minimums : [];
  const ratioTotal = ratios.reduce((sum, ratio) => sum + ratio, 0) || 1;
  const widths = ratios.map((ratio, index) => Math.max(activeMinimums[index] ?? 1, Math.floor((available * ratio) / ratioTotal)));
  let delta = available - widths.reduce((sum, width) => sum + width, 0);

  for (let index = 0; delta !== 0 && widths.length > 0; index = (index + 1) % widths.length) {
    if (delta > 0) {
      widths[index] += 1;
      delta -= 1;
    } else if (widths[index] > (activeMinimums[index] ?? 1)) {
      widths[index] -= 1;
      delta += 1;
    } else {
      break;
    }
  }

  return widths;
}

export function box(title: string, body: string | string[], options: BoxOptions): string {
  const width = Math.max(4, Math.floor(options.width));
  const innerWidth = Math.max(2, width - 2);
  const paddingX = clamp(Math.floor(options.paddingX ?? 0), 0, Math.max(0, Math.floor((innerWidth - 1) / 2)));
  const contentWidth = Math.max(1, innerWidth - paddingX * 2);
  const accent = options.accent ?? theme.border;
  const useColor = options.color ?? true;
  const lines = Array.isArray(body) ? [...body] : String(body || "").split("\n");
  const contentHeight = options.height ? Math.max(0, options.height - 2) : lines.length;
  const titleAlign = options.titleAlign ?? "center";

  const rawTitle = title ? ` ${title} ` : "";
  const titleText = truncate(rawTitle, innerWidth);
  const topFill = Math.max(0, innerWidth - visibleLength(titleText));
  const leftFill = titleAlign === "left" && topFill > 0 ? 1 : Math.floor(topFill / 2);
  const rightFill = titleAlign === "left" ? Math.max(0, topFill - leftFill) : Math.ceil(topFill / 2);
  const top = title
    ? `${rgb("┌", accent, useColor)}${rgb("─".repeat(leftFill), accent, useColor)}${bold(rgb(titleText, accent, useColor), useColor)}${rgb("─".repeat(rightFill), accent, useColor)}${rgb("┐", accent, useColor)}`
    : rgb(`┌${"─".repeat(innerWidth)}┐`, accent, useColor);

  const visibleLines = lines.slice(0, contentHeight);
  while (visibleLines.length < contentHeight) visibleLines.push("");
  const pad = " ".repeat(paddingX);
  const content = visibleLines.map(
    (line) => `${rgb("│", accent, useColor)}${pad}${fitAnsi(line, contentWidth)}${pad}${rgb("│", accent, useColor)}`
  );
  const bottom = rgb(`└${"─".repeat(innerWidth)}┘`, accent, useColor);
  return [top, ...content, bottom].join("\n");
}

export function hstack(blocks: string[], gap = 1): string {
  if (blocks.length === 0) return "";
  const splitBlocks = blocks.map((block) => String(block).split("\n"));
  const widths = splitBlocks.map((lines) => Math.max(0, ...lines.map((line) => visibleLength(line))));
  const height = Math.max(0, ...splitBlocks.map((lines) => lines.length));
  const spacer = " ".repeat(gap);
  const rows: string[] = [];

  for (let row = 0; row < height; row += 1) {
    rows.push(splitBlocks.map((lines, index) => fitAnsi(lines[row] ?? "", widths[index] ?? 0)).join(spacer));
  }

  return rows.join("\n");
}

export function tableRow(values: string[], widths: number[], gap = "  "): string {
  return values.map((value, index) => fitAnsi(value, widths[index] ?? 8)).join(gap);
}

export function normalizeFrame(frame: string, width: number, height: number): string {
  const lines = frame.split("\n").slice(0, height);
  while (lines.length < height) lines.push("");
  return lines.map((line) => fitAnsi(line, width)).join("\n");
}

export function renderKeyValueRow(label: string, value: string, width: number, color = true): string {
  return joinAligned(`${rgb(label, theme.muted, color)}  ${value}`, rgb("›", theme.muted, color), width);
}

export function divider(width: number, color = true): string {
  return rgb(repeatToWidth("─", width), theme.border, color);
}
