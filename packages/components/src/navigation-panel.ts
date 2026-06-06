import { dim, rgb, selectedLine, theme } from "@prettui/core";
import { divider, renderKeyValueRow } from "@prettui/core";
import { renderPanel } from "./panel";

export type NavigationItem = {
  icon: string;
  label: string;
  active?: boolean;
};

export type FilterRow = {
  label: string;
  value: string;
};

export function renderNavigationPanel(props: {
  items: NavigationItem[];
  filters?: FilterRow[];
  searchHint?: string;
  width: number;
  height: number;
  active?: boolean;
  color?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const lines: string[] = [rgb("NAVIGATION", theme.green, color)];
  for (const item of props.items) {
    const row = ` ${rgb(item.icon, theme.slate, color)}  ${item.label}${item.active ? " ›" : ""}`;
    lines.push(item.active ? selectedLine(row, inner, color) : row);
  }
  if (props.filters?.length) {
    lines.push(divider(inner, color));
    lines.push(rgb("FILTERS", theme.green, color));
    for (const filter of props.filters) lines.push(renderKeyValueRow(filter.label, filter.value, inner, color));
  }
  lines.push(divider(inner, color));
  lines.push(rgb("⌕ SEARCH", theme.green, color));
  lines.push(dim(props.searchHint ?? "Press / to filter events...", color));
  return renderPanel({
    children: lines,
    width: props.width,
    height: props.height,
    color,
    paddingX: 1,
    accent: props.active ? theme.cyan : undefined,
  });
}
