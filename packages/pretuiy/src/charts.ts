import { bold, clamp, dim, fitAnsi, rgb, theme, type Rgb } from "./ansi";

export function bars(values: number[], width: number, accent: Rgb, enabled = true): string {
  if (width <= 0) return "";
  const glyphs = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const sample = values.length >= width ? values.slice(values.length - width) : [...values];
  while (sample.length < width) sample.unshift(sample[0] ?? 0);
  const min = Math.min(...sample);
  const max = Math.max(...sample);
  const span = max - min || 1;
  return rgb(
    sample.map((value) => glyphs[clamp(Math.round(((value - min) / span) * (glyphs.length - 1)), 0, glyphs.length - 1)]).join(""),
    accent,
    enabled
  );
}

export function lowBars(values: number[], width: number, accent: Rgb, enabled = true): string {
  if (width <= 0) return "";
  const glyphs = ["▁", "▁", "▁", "▂", "▂", "▃", "▃", "▄"];
  const sample = values.length >= width ? values.slice(values.length - width) : [...values];
  while (sample.length < width) sample.unshift(sample[0] ?? 0);
  const min = Math.min(...sample);
  const max = Math.max(...sample);
  const span = max - min || 1;
  return rgb(
    sample.map((value) => glyphs[clamp(Math.round(((value - min) / span) * (glyphs.length - 1)), 0, glyphs.length - 1)]).join(""),
    accent,
    enabled
  );
}

export function dotSparkline(values: number[], width: number, accent: Rgb, enabled = true): string {
  if (width <= 0) return "";
  const glyphs = ["⠁", "⠂", "⠄", "⠂", "⠆", "⠒", "⠲", "⠶"];
  const sample = values.length >= width ? values.slice(values.length - width) : [...values];
  while (sample.length < width) sample.unshift(sample[0] ?? 0);
  const min = Math.min(...sample);
  const max = Math.max(...sample);
  const span = max - min || 1;
  return rgb(
    sample.map((value) => glyphs[clamp(Math.round(((value - min) / span) * (glyphs.length - 1)), 0, glyphs.length - 1)]).join(""),
    accent,
    enabled
  );
}

export function dashSpark(width: number, accent: Rgb, enabled = true): string {
  return rgb("─".repeat(Math.max(0, width)), accent, enabled);
}

export type DonutSegment = {
  label: string;
  value: number;
  color: Rgb;
};

const brailleDots = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

function segmentIndexAt(ratio: number, segments: DonutSegment[], total: number): number {
  let cursor = 0;
  for (let index = 0; index < segments.length; index += 1) {
    cursor += segments[index].value / total;
    if (ratio <= cursor || index === segments.length - 1) return index;
  }
  return 0;
}

function overlayLabel(cells: string[][], row: number, label: string, color: Rgb, enabled: boolean, strong = false): void {
  if (row < 0 || row >= cells.length || !label) return;
  const chars = Array.from(label.trim());
  const start = Math.max(0, Math.floor((cells[row].length - chars.length) / 2));
  const clearStart = Math.max(0, start - 1);
  const clearEnd = Math.min(cells[row].length, start + chars.length + 1);
  for (let index = clearStart; index < clearEnd; index += 1) cells[row][index] = " ";
  for (let index = 0; index < chars.length && start + index < cells[row].length; index += 1) {
    const painted = rgb(chars[index], color, enabled);
    cells[row][start + index] = strong ? bold(painted, enabled) : painted;
  }
}

export function segmentedDonut(
  segments: DonutSegment[],
  options: { width: number; height: number; centerLabel?: string; centerSubLabel?: string; color?: boolean; startAngle?: number }
): string[] {
  const width = Math.max(6, Math.floor(options.width));
  const height = Math.max(3, Math.floor(options.height));
  const activeSegments = segments.filter((segment) => segment.value > 0);
  const safeSegments = activeSegments.length ? activeSegments : [{ label: "Total", value: 1, color: theme.slate }];
  const total = safeSegments.reduce((sum, segment) => sum + segment.value, 0);
  const enabled = options.color ?? true;
  const dotWidth = width * 2;
  const dotHeight = height * 4;
  const centerX = (dotWidth - 1) / 2;
  const centerY = (dotHeight - 1) / 2;
  const outerRadius = Math.max(2, Math.min(dotWidth, dotHeight) / 2 - 1);
  const innerRadius = Math.max(1, outerRadius * 0.64);
  const startAngle = options.startAngle ?? -Math.PI / 2;
  const cells = Array.from({ length: height }, () => Array.from({ length: width }, () => " "));

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      let mask = 0;
      const counts = new Map<number, number>();
      for (let dotY = 0; dotY < 4; dotY += 1) {
        for (let dotX = 0; dotX < 2; dotX += 1) {
          const x = col * 2 + dotX;
          const y = row * 4 + dotY;
          const distance = Math.hypot(x - centerX, y - centerY);
          if (distance < innerRadius || distance > outerRadius) continue;
          const normalizedAngle = (Math.atan2(y - centerY, x - centerX) - startAngle + Math.PI * 2) % (Math.PI * 2);
          const segment = segmentIndexAt(normalizedAngle / (Math.PI * 2), safeSegments, total);
          mask += brailleDots[dotY][dotX];
          counts.set(segment, (counts.get(segment) ?? 0) + 1);
        }
      }
      if (!mask) continue;
      const selected = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 0;
      cells[row][col] = rgb(String.fromCharCode(0x2800 + mask), safeSegments[selected]?.color ?? theme.slate, enabled);
    }
  }

  const centerRow = Math.floor(height / 2);
  overlayLabel(
    cells,
    options.centerSubLabel ? centerRow - 1 : centerRow,
    fitAnsi(options.centerLabel ?? "", Math.max(0, width - 2)).trim(),
    theme.text,
    enabled,
    true
  );
  overlayLabel(cells, centerRow, options.centerSubLabel ?? "", theme.muted, enabled);

  return cells.map((line) => line.join(""));
}

export function legendLine(label: string, value: string, color: Rgb, enabled = true): string {
  return `${rgb("■", color, enabled)} ${label} ${dim(value, enabled)}`;
}
