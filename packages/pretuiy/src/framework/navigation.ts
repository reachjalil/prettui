import { clamp } from "../ansi";
import type { TuiAppState, TuiNavigationItem, TuiNavigationRow, TuiNavigationSection } from "./types";

export function defaultExpandedSectionIds(sections: readonly TuiNavigationSection[]): string[] {
  return sections.filter((section) => section.defaultExpanded !== false).map((section) => section.id);
}

function appendItemRows(
  rows: TuiNavigationRow[],
  sectionId: string,
  items: readonly TuiNavigationItem[],
  depth: number,
  counter: { value: number }
): void {
  for (const item of items) {
    rows.push({
      kind: "item",
      sectionId,
      item,
      itemIndex: counter.value,
      depth,
    });
    counter.value += 1;
    if (item.children?.length) appendItemRows(rows, sectionId, item.children, depth + 1, counter);
  }
}

export function buildNavigationRows(sections: readonly TuiNavigationSection[], expandedSectionIds: readonly string[]): TuiNavigationRow[] {
  const rows: TuiNavigationRow[] = [];
  const expanded = new Set(expandedSectionIds);
  const itemCounter = { value: 0 };

  sections.forEach((section, sectionIndex) => {
    const sectionExpanded = expanded.has(section.id);
    rows.push({
      kind: "section",
      sectionId: section.id,
      label: section.label,
      expanded: sectionExpanded,
      sectionIndex,
    });
    if (sectionExpanded) appendItemRows(rows, section.id, section.items, 0, itemCounter);
  });

  return rows;
}

export function clampNavigationRowIndex(rows: readonly TuiNavigationRow[], index: number): number {
  return clamp(Math.floor(index), 0, Math.max(0, rows.length - 1));
}

export function toggleNavigationSection(state: TuiAppState, row: TuiNavigationRow): TuiAppState {
  if (row.kind !== "section") return state;
  const expanded = new Set(state.expandedSectionIds);
  if (expanded.has(row.sectionId)) expanded.delete(row.sectionId);
  else expanded.add(row.sectionId);
  return {
    ...state,
    expandedSectionIds: [...expanded],
  };
}

export function navigationRouteIdFromRow(row: TuiNavigationRow | undefined): string | undefined {
  if (row?.kind !== "item" || row.item.disabled) return undefined;
  return row.item.routeId;
}

export function findNavigationRowIndexForRoute(rows: readonly TuiNavigationRow[], routeId: string): number {
  return rows.findIndex((row) => row.kind === "item" && row.item.routeId === routeId);
}
