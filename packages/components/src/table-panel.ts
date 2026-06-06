import { clamp, dim, fitAnsi, joinAligned, right, rgb, selectedLine, theme } from "@prettui/core";
import { tableRow } from "@prettui/core";
import { renderPanel } from "./panel";

export type TableColumn<T> = {
  label: string;
  width: number;
  align?: "left" | "right";
  render: (row: T) => string;
};

export function renderTablePanel<T>(props: {
  title: string;
  titleRight?: string;
  rows: T[];
  columns: TableColumn<T>[];
  width: number;
  height: number;
  selectedIndex?: number;
  emptyLabel?: string;
  footer?: string;
  color?: boolean;
  accent?: typeof theme.border;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const lines: string[] = [joinAligned(rgb(props.title, theme.green, color), props.titleRight ?? "", inner)];
  lines.push(dim(props.columns.map((column) => fitAnsi(column.label, column.width)).join(" "), color));
  const availableRows = Math.max(0, props.height - 5);
  const selectedIndex = clamp(Math.floor(props.selectedIndex ?? 0), 0, Math.max(0, props.rows.length - 1));
  const scrollOffset =
    availableRows > 0 ? clamp(selectedIndex - Math.floor(availableRows / 2), 0, Math.max(0, props.rows.length - availableRows)) : 0;
  const visibleRows = props.rows.slice(scrollOffset, scrollOffset + availableRows);
  for (let index = 0; index < visibleRows.length; index += 1) {
    const row = visibleRows[index];
    const rendered = tableRow(
      props.columns.map((column) => {
        const value = column.render(row);
        return column.align === "right" ? right(value, column.width) : fitAnsi(value, column.width);
      }),
      props.columns.map((column) => column.width),
      " "
    );
    const isSelected = scrollOffset + index === selectedIndex;
    const line = `${isSelected ? rgb("›", theme.green, color) : " "} ${rendered}`;
    lines.push(isSelected ? selectedLine(line, inner, color) : fitAnsi(line, inner));
  }
  if (visibleRows.length === 0) lines.push(dim(props.emptyLabel ?? "No rows", color));
  while (lines.length < props.height - 3) lines.push("");
  if (props.footer) lines.push(joinAligned("", dim(props.footer, color), inner));
  return renderPanel({ children: lines, width: props.width, height: props.height, color, paddingX: 1, accent: props.accent });
}
