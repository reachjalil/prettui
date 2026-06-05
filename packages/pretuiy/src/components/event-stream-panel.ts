import { rgb, theme } from "../ansi";
import { renderTablePanel } from "./table-panel";

export type EventStreamRow = {
  time: string;
  event: string;
  session: string;
  turn: string;
  tool: string;
  risk: "LOW" | "MED" | "HIGH";
  duration: string;
  tone: "green" | "red" | "amber" | "cyan" | "purple" | "lime" | "white" | "slate";
};

export function renderEventStreamPanel(props: {
  rows: EventStreamRow[];
  width: number;
  height: number;
  filter?: string;
  selectedIndex?: number;
  active?: boolean;
  color?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const full = inner >= 84;
  const eventWidth = Math.max(14, inner - (full ? 66 : 27));
  const columns = full
    ? [
        { label: "TIME", width: 13, render: (row: EventStreamRow) => row.time },
        {
          label: "HOOK EVENT",
          width: eventWidth,
          render: (row: EventStreamRow) => `${rgb("●", theme[row.tone], color)} ${rgb(row.event, theme[row.tone], color)}`,
        },
        { label: "SESSION", width: 16, render: (row: EventStreamRow) => row.session },
        { label: "TURN", width: 5, align: "right" as const, render: (row: EventStreamRow) => row.turn },
        { label: "TOOL", width: 9, render: (row: EventStreamRow) => row.tool },
        {
          label: "RISK",
          width: 7,
          render: (row: EventStreamRow) =>
            rgb(row.risk, row.risk === "HIGH" ? theme.red : row.risk === "MED" ? theme.amber : theme.green, color),
        },
        { label: "DUR", width: 7, align: "right" as const, render: (row: EventStreamRow) => row.duration },
      ]
    : [
        { label: "TIME", width: 9, render: (row: EventStreamRow) => row.time.slice(0, 8) },
        {
          label: "HOOK EVENT",
          width: eventWidth,
          render: (row: EventStreamRow) => `${rgb("●", theme[row.tone], color)} ${rgb(row.event, theme[row.tone], color)}`,
        },
        { label: "RISK", width: 5, render: (row: EventStreamRow) => rgb(row.risk, row.risk === "MED" ? theme.amber : theme.green, color) },
        { label: "DUR", width: 6, align: "right" as const, render: (row: EventStreamRow) => row.duration },
      ];

  return renderTablePanel({
    title: "EVENT STREAM (LIVE)",
    titleRight: `${rgb("Filter:", theme.muted, color)} ${rgb(props.filter ?? "All", theme.green, color)}`,
    rows: props.rows,
    columns,
    selectedIndex: props.selectedIndex ?? 0,
    footer: "(Streaming...)",
    width: props.width,
    height: props.height,
    color,
    accent: props.active ? theme.cyan : theme.border,
  });
}
