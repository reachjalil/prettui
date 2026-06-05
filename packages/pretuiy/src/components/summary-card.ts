import { bold, dim, fitAnsi, joinAligned, rgb, theme, visibleLength, type Tone } from "../ansi";
import { bars, dashSpark, dotSparkline, lowBars } from "../charts";
import { box, hstack, splitWidths } from "../layout";

export type SummaryMetric = {
  title: string;
  value: string;
  delta: string;
  tone: Tone;
  sparkValues?: number[];
  spark?: "bars" | "lowBars" | "dots" | "dash";
};

export function renderSummaryCard(metric: SummaryMetric, width: number, color = true): string {
  const accent = theme[metric.tone];
  const inner = Math.max(12, width - 4);
  const sparkWidth = Math.max(8, Math.min(Math.floor(inner * 0.46), inner - visibleLength(metric.value) - 4));
  const values = metric.sparkValues ?? [];
  const spark =
    metric.spark === "dash"
      ? dashSpark(sparkWidth, accent, color)
      : metric.spark === "bars"
        ? bars(values, sparkWidth, accent, color)
        : metric.spark === "lowBars"
          ? lowBars(values, sparkWidth, accent, color)
          : dotSparkline(values, sparkWidth, accent, color);
  const body = [
    rgb(metric.title, accent, color),
    joinAligned(bold(rgb(metric.value, theme.white, color), color), spark, inner),
    rgb(metric.delta, metric.delta.trim().startsWith("↓") ? theme.red : theme.green, color),
    "",
  ];
  return box("", body, { width, height: 6, accent, color, paddingX: 1 });
}

export function summaryCardColumns(width: number): number {
  if (width >= 146) return 6;
  if (width >= 104) return 3;
  if (width >= 72) return 2;
  return 1;
}

export function renderSummaryCards(metrics: SummaryMetric[], width: number, color = true): string {
  const columns = summaryCardColumns(width);
  const rows: string[] = [];
  for (let index = 0; index < metrics.length; index += columns) {
    const row = metrics.slice(index, index + columns);
    const widths = splitWidths(width, row.length, 1, 18);
    rows.push(
      hstack(
        row.map((metric, rowIndex) => renderSummaryCard(metric, widths[rowIndex] ?? 18, color)),
        1
      )
    );
  }
  return rows.join("\n");
}

export function renderEmptySummary(width: number, color = true): string {
  return box("", [dim("No summary metrics", color), fitAnsi("", Math.max(1, width - 4))], { width, height: 6, color, paddingX: 1 });
}
