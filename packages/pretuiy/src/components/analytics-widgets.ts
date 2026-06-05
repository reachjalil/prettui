import { bars, dotSparkline, segmentedDonut, type DonutSegment } from "../charts";
import { bold, dim, fitAnsi, joinAligned, rgb, selectedLine, theme, truncate, type Rgb, type Tone } from "../ansi";
import { box, hstack, splitRatioWidths, tableRow } from "../layout";

const toneColor: Record<Tone, Rgb> = {
  green: theme.green,
  red: theme.red,
  amber: theme.amber,
  cyan: theme.cyan,
  blue: theme.blue,
  purple: theme.purple,
  slate: theme.slate,
  lime: theme.lime,
  white: theme.white,
};

export type StatusStripCell = {
  title: string;
  status?: string;
  tone?: Tone;
  lines: Array<{ label?: string; value: string; tone?: Tone }>;
};

export function renderStatusStrip(props: {
  cells: StatusStripCell[];
  width: number;
  height: number;
  color?: boolean;
  active?: boolean;
}): string {
  const color = props.color ?? true;
  const widths = splitRatioWidths(
    props.width,
    props.cells.map(() => 1),
    1,
    props.cells.map(() => 12)
  );
  return hstack(
    props.cells.map((cell, index) => {
      const width = widths[index] ?? 12;
      const title = cell.status
        ? `${bold(cell.title.toUpperCase(), color)} ${rgb("●", toneColor[cell.tone ?? "green"], color)} ${rgb(cell.status, toneColor[cell.tone ?? "green"], color)}`
        : bold(cell.title.toUpperCase(), color);
      const lines = [
        title,
        ...cell.lines.map((line) => {
          const value = rgb(line.value, toneColor[line.tone ?? "white"], color);
          return line.label ? `${dim(line.label, color)} ${value}` : value;
        }),
      ];
      return box("", lines, { width, height: props.height, color, paddingX: 1, accent: props.active ? theme.cyan : theme.border });
    }),
    1
  );
}

export type KeyValueRow = {
  label: string;
  value: string;
  tone?: Tone;
  sparkValues?: number[];
};

export function renderKeyValuePanel(props: {
  title: string;
  rows: KeyValueRow[];
  width: number;
  height: number;
  color?: boolean;
  tone?: Tone;
  active?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const labelWidth = Math.min(16, Math.max(8, Math.floor(inner * 0.38)));
  const sparkWidth = Math.max(0, inner - labelWidth - 16);
  const lines = [
    rgb(props.title.toUpperCase(), toneColor[props.tone ?? "green"], color),
    ...props.rows.map((row) => {
      const value = rgb(row.value, toneColor[row.tone ?? "white"], color);
      const spark = row.sparkValues?.length ? ` ${dotSparkline(row.sparkValues, sparkWidth, toneColor[row.tone ?? "green"], color)}` : "";
      return `${fitAnsi(dim(row.label, color), labelWidth)} ${fitAnsi(value, Math.max(1, inner - labelWidth - sparkWidth - 1))}${spark}`;
    }),
  ];
  return box("", lines, { width: props.width, height: props.height, color, paddingX: 1, accent: props.active ? theme.cyan : theme.border });
}

export type TimelinePanelRow = {
  time: string;
  label: string;
  detail: string;
  tone?: Tone;
  meta?: string;
  position?: number;
};

export function renderTimelinePanel(props: {
  title: string;
  rows: TimelinePanelRow[];
  width: number;
  height: number;
  color?: boolean;
  selectedIndex?: number;
  filterLabel?: string;
  waterfall?: boolean;
  active?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const title = joinAligned(
    rgb(props.title.toUpperCase(), theme.green, color),
    props.filterLabel ? dim(props.filterLabel, color) : "",
    inner
  );
  const rowLimit = Math.max(0, props.height - 5);
  const selected = Math.max(0, Math.min(Math.floor(props.selectedIndex ?? 0), Math.max(0, props.rows.length - 1)));
  const start = Math.max(0, Math.min(selected - Math.floor(rowLimit / 2), Math.max(0, props.rows.length - rowLimit)));
  const visible = props.rows.slice(start, start + rowLimit);
  const timeWidth = props.waterfall ? 8 : 12;
  const labelWidth = props.waterfall
    ? Math.min(18, Math.max(12, Math.floor(inner * 0.2)))
    : Math.min(22, Math.max(14, Math.floor(inner * 0.28)));
  const plotWidth = props.waterfall ? Math.max(10, Math.floor(inner * 0.3)) : 0;
  const detailWidth = Math.max(8, inner - timeWidth - labelWidth - plotWidth - (props.waterfall ? 6 : 4));
  const header = props.waterfall
    ? tableRow(["TIME", "HOOK", "-60s      -30s       NOW", "DETAIL"], [timeWidth, labelWidth, plotWidth, detailWidth], " ")
    : tableRow(["TIME", "EVENT", "DETAIL"], [timeWidth, labelWidth, detailWidth], " ");
  const lines = [title, dim(header, color)];

  for (let index = 0; index < visible.length; index += 1) {
    const row = visible[index];
    const accent = toneColor[row.tone ?? "green"];
    const marker = rgb("●", accent, color);
    const plot =
      props.waterfall && plotWidth > 0
        ? Array.from({ length: plotWidth }, (_, cell) => {
            const pos = Math.max(0, Math.min(plotWidth - 1, Math.round((row.position ?? 0.5) * (plotWidth - 1))));
            if (cell === pos) return rgb("■", accent, color);
            return cell % Math.max(2, Math.floor(plotWidth / 4)) === 0 ? rgb("│", theme.grid, color) : dim("·", color);
          }).join("")
        : "";
    const rendered = props.waterfall
      ? tableRow(
          [dim(row.time, color), rgb(row.label, accent, color), plot, row.detail],
          [timeWidth, labelWidth, plotWidth, detailWidth],
          " "
        )
      : tableRow(
          [dim(row.time, color), `${marker} ${rgb(row.label, accent, color)}`, row.detail],
          [timeWidth, labelWidth, detailWidth],
          " "
        );
    const isSelected = start + index === selected;
    lines.push(isSelected ? selectedLine(`› ${rendered}`, inner, color) : fitAnsi(`  ${rendered}`, inner));
  }

  if (visible.length === 0) lines.push(dim("No rows match the active controls", color));
  while (lines.length < props.height - 3) lines.push("");
  lines.push(joinAligned("", dim("(live)", color), inner));
  return box("", lines, { width: props.width, height: props.height, color, paddingX: 1, accent: props.active ? theme.cyan : theme.border });
}

export function renderDonutSummaryPanel(props: {
  title: string;
  segments: DonutSegment[];
  totalLabel: string;
  subLabel?: string;
  width: number;
  height: number;
  color?: boolean;
  active?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const total = props.segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const donutWidth = inner >= 54 ? 16 : 13;
  const donutHeight = props.height >= 13 ? 7 : 5;
  const donut = segmentedDonut(props.segments, {
    width: donutWidth,
    height: donutHeight,
    centerLabel: props.totalLabel,
    centerSubLabel: props.subLabel,
    color,
  }).join("\n");
  const legend = props.segments.map((segment) => {
    const percent = Math.round((segment.value / total) * 100);
    return `${rgb("■", segment.color, color)} ${fitAnsi(segment.label, 10)} ${String(segment.value).padStart(4)} ${String(`${percent}%`).padStart(4)}`;
  });
  const body = inner >= 42 ? hstack([donut, legend.join("\n")], 2).split("\n") : [...donut.split("\n"), ...legend];
  return box("", [rgb(props.title.toUpperCase(), theme.green, color), ...body], {
    width: props.width,
    height: props.height,
    color,
    paddingX: 1,
    accent: props.active ? theme.cyan : theme.border,
  });
}

export type HeatmapRow = {
  label: string;
  values: number[];
};

export function renderHeatmapPanel(props: {
  title: string;
  rows: HeatmapRow[];
  width: number;
  height: number;
  color?: boolean;
  active?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const labelWidth = Math.min(15, Math.max(8, Math.floor(inner * 0.28)));
  const maxCells = Math.max(4, Math.floor((inner - labelWidth - 2) / 2));
  const cell = (value: number) => {
    if (value < 0.16) return rgb("■", theme.grid, color);
    if (value > 0.76) return rgb("■", theme.amber, color);
    return rgb("■", theme.green, color);
  };
  const lines = [
    rgb(props.title.toUpperCase(), theme.green, color),
    ...props.rows
      .slice(0, Math.max(0, props.height - 5))
      .map((row) => `${rgb(fitAnsi(row.label, labelWidth), theme.green, color)} ${row.values.slice(-maxCells).map(cell).join(" ")}`),
    "",
    dim("   -60m      -30m       now", color),
  ];
  return box("", lines, { width: props.width, height: props.height, color, paddingX: 1, accent: props.active ? theme.cyan : theme.border });
}

export function renderLogPanel(props: {
  title: string;
  rows: TimelinePanelRow[];
  width: number;
  height: number;
  color?: boolean;
  active?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const lines = [
    `${rgb(props.title.toUpperCase(), theme.green, color)} ${dim("(stream)", color)}`,
    ...props.rows.slice(0, Math.max(0, props.height - 4)).map((row) => {
      const accent = toneColor[row.tone ?? "green"];
      return `${dim(row.time, color)}  ${rgb(fitAnsi(row.label, 6), accent, color)}  ${truncate(row.detail, Math.max(8, inner - 18))}`;
    }),
  ];
  return box("", lines, { width: props.width, height: props.height, color, paddingX: 1, accent: props.active ? theme.cyan : theme.border });
}

export function renderSparkSectionsPanel(props: {
  title: string;
  sections: Array<{ label: string; value: string; detail: string; tone: Tone; values: number[] }>;
  width: number;
  height: number;
  color?: boolean;
  active?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const sectionWidth = Math.max(16, Math.floor(inner / Math.max(1, props.sections.length)));
  const blocks = props.sections.map((section) => {
    const accent = toneColor[section.tone];
    return [
      rgb(`● ${section.label.toUpperCase()}  ${section.value}`, accent, color),
      dim(section.detail, color),
      bars(section.values, Math.max(8, sectionWidth - 3), accent, color),
    ].join("\n");
  });
  return box("", [rgb(props.title.toUpperCase(), theme.green, color), ...hstack(blocks, 2).split("\n")], {
    width: props.width,
    height: props.height,
    color,
    paddingX: 1,
    accent: props.active ? theme.cyan : theme.border,
  });
}

export function renderTextPanel(props: {
  title: string;
  lines: string[];
  width: number;
  height: number;
  color?: boolean;
  tone?: Tone;
  active?: boolean;
}): string {
  const color = props.color ?? true;
  return box("", [rgb(props.title.toUpperCase(), toneColor[props.tone ?? "green"], color), ...props.lines], {
    width: props.width,
    height: props.height,
    color,
    paddingX: 1,
    accent: props.active ? theme.cyan : theme.border,
  });
}
