import { dim, fitAnsi, joinAligned, rgb, theme } from "@prettui/core";
import { renderPanel } from "./panel";

export type FileWatcherRow = {
  time: string;
  kind: string;
  path: string;
  delta: string;
  fileType: string;
  summary: string;
};

export function renderFileWatcherPanel(props: {
  title?: string;
  subtitle?: string;
  watching?: string;
  rows: FileWatcherRow[];
  width: number;
  height: number;
  active?: boolean;
  color?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const header = joinAligned(
    `${rgb(props.title ?? "FILE WATCHER", theme.green, color)} ${dim(props.subtitle ?? "(terminal automation file system changes)", color)}`,
    props.watching
      ? `${dim("Watching:", color)} ${props.watching}     ${dim("Auto-scroll:", color)} ${rgb("ON ●", theme.green, color)}`
      : "",
    inner
  );
  const pathWidth = Math.max(18, Math.min(34, Math.floor(inner * 0.24)));
  const summaryWidth = Math.max(16, inner - 8 - 10 - pathWidth - 12 - 14 - 6);
  const lines = [header];
  for (const row of props.rows.slice(0, Math.max(0, props.height - 4))) {
    lines.push(
      [
        fitAnsi(dim(row.time, color), 8),
        fitAnsi(dim(row.kind, color), 10),
        fitAnsi(row.path, pathWidth),
        fitAnsi(row.delta, 12),
        fitAnsi(row.fileType, 14),
        fitAnsi(row.summary, summaryWidth),
      ].join(" ")
    );
  }
  return renderPanel({
    children: lines,
    width: props.width,
    height: props.height,
    color,
    paddingX: 1,
    accent: props.active ? theme.cyan : undefined,
  });
}
