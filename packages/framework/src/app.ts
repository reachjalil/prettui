import { clamp, dim, joinAligned, rgb, selectedLine, theme, truncate } from "@prettui/core";
import type { FooterItem } from "@prettui/components";
import { renderBrandHeader, renderFooter, renderPanel } from "@prettui/components";
import { divider, hstack, normalizeFrame, renderKeyValueRow, splitRatioWidths } from "@prettui/core";
import { defaultFocusZones, moveFocusZone, normalizeFocusZone } from "./focus";
import {
  buildNavigationRows,
  clampNavigationRowIndex,
  defaultExpandedSectionIds,
  findNavigationRowIndexForRoute,
  navigationRouteIdFromRow,
  toggleNavigationSection,
} from "./navigation";
import { goBack, navigateToRoute, resolveRoute } from "./routing";
import { advanceTransition, startTransition } from "./transitions";
import type {
  TuiAppDefinition,
  TuiAppEvent,
  TuiAppState,
  TuiMenu,
  TuiMenuItem,
  TuiNavigationRow,
  TuiRenderOptions,
  TuiRouteDefinition,
} from "./types";

export type TuiAppStateInput = Partial<Omit<TuiAppState, "history">> & {
  history?: readonly string[];
};

function appFocusZones<TContext>(definition: TuiAppDefinition<TContext>): readonly string[] {
  if (definition.focusZones?.length) return definition.focusZones;
  return definition.menus?.length ? defaultFocusZones : defaultFocusZones.filter((zone) => zone !== "menu");
}

function activeMenuForRoute<TContext>(
  definition: TuiAppDefinition<TContext>,
  route: TuiRouteDefinition<TContext>,
  preferredMenuId: string | undefined
): TuiMenu | undefined {
  if (!definition.menus?.length) return undefined;
  return (
    definition.menus.find((menu) => menu.id === preferredMenuId) ??
    definition.menus.find((menu) => menu.id === route.menuId) ??
    definition.menus.find((menu) => menu.id === definition.initialMenuId) ??
    definition.menus[0]
  );
}

function clampMenuItemIndex(menu: TuiMenu | undefined, index: number): number {
  return clamp(Math.floor(index), 0, Math.max(0, (menu?.items.length ?? 1) - 1));
}

function syncStateAfterRoute<TContext>(definition: TuiAppDefinition<TContext>, state: TuiAppState): TuiAppState {
  const route = resolveRoute(definition.routes, state.routeId);
  const rows = buildNavigationRows(definition.navigation, state.expandedSectionIds);
  const activeMenu = activeMenuForRoute(definition, route, state.activeMenuId);

  return {
    ...state,
    focusZone: normalizeFocusZone(appFocusZones(definition), state.focusZone),
    navigationRowIndex: clampNavigationRowIndex(rows, state.navigationRowIndex),
    activeMenuId: activeMenu?.id,
    menuItemIndex: clampMenuItemIndex(activeMenu, state.menuItemIndex),
  };
}

function alignNavigationToRoute<TContext>(definition: TuiAppDefinition<TContext>, state: TuiAppState): TuiAppState {
  const route = resolveRoute(definition.routes, state.routeId);
  const synced = syncStateAfterRoute(definition, {
    ...state,
    activeMenuId: route.menuId ?? state.activeMenuId,
  });
  const rows = buildNavigationRows(definition.navigation, synced.expandedSectionIds);
  const routeRowIndex = findNavigationRowIndexForRoute(rows, synced.routeId);
  return routeRowIndex >= 0 ? { ...synced, navigationRowIndex: routeRowIndex } : synced;
}

export function createTuiAppState<TContext>(definition: TuiAppDefinition<TContext>, input: TuiAppStateInput = {}): TuiAppState {
  const routeId = input.routeId ?? definition.initialRouteId;
  const route = resolveRoute(definition.routes, routeId);
  const expandedSectionIds = [...(input.expandedSectionIds ?? defaultExpandedSectionIds(definition.navigation))];
  const rows = buildNavigationRows(definition.navigation, expandedSectionIds);
  const routeRowIndex = findNavigationRowIndexForRoute(rows, routeId);
  const activeMenu = activeMenuForRoute(definition, route, input.activeMenuId);

  const initialState: TuiAppState = {
    routeId,
    history: [...(input.history ?? [])],
    focusZone: normalizeFocusZone(appFocusZones(definition), input.focusZone),
    expandedSectionIds,
    navigationRowIndex: input.navigationRowIndex ?? Math.max(0, routeRowIndex),
    activeMenuId: activeMenu?.id,
    menuItemIndex: clampMenuItemIndex(activeMenu, input.menuItemIndex ?? 0),
    transition: input.transition,
  };

  return input.navigationRowIndex === undefined
    ? alignNavigationToRoute(definition, initialState)
    : syncStateAfterRoute(definition, initialState);
}

function selectNavigationRow<TContext>(
  definition: TuiAppDefinition<TContext>,
  state: TuiAppState,
  row: TuiNavigationRow | undefined
): TuiAppState {
  if (!row) return state;
  if (row.kind === "section") {
    const toggled = toggleNavigationSection(state, row);
    const rows = buildNavigationRows(definition.navigation, toggled.expandedSectionIds);
    return {
      ...toggled,
      navigationRowIndex: clampNavigationRowIndex(rows, toggled.navigationRowIndex),
      transition: startTransition({ kind: "menu", fromRouteId: state.routeId, toRouteId: state.routeId }),
    };
  }

  const routeId = navigationRouteIdFromRow(row);
  if (!routeId) return state;
  resolveRoute(definition.routes, routeId);
  return alignNavigationToRoute(definition, navigateToRoute(state, routeId, "push"));
}

function selectedMenuItem<TContext>(definition: TuiAppDefinition<TContext>, state: TuiAppState): TuiMenuItem | undefined {
  const route = resolveRoute(definition.routes, state.routeId);
  const menu = activeMenuForRoute(definition, route, state.activeMenuId);
  return menu?.items[state.menuItemIndex];
}

export function reduceTuiAppEvent<TContext>(definition: TuiAppDefinition<TContext>, state: TuiAppState, event: TuiAppEvent): TuiAppState {
  const zones = appFocusZones(definition);
  const rows = buildNavigationRows(definition.navigation, state.expandedSectionIds);
  const route = resolveRoute(definition.routes, state.routeId);
  const activeMenu = activeMenuForRoute(definition, route, state.activeMenuId);

  if (event.type === "tick") {
    return {
      ...state,
      transition: advanceTransition(state.transition, event.amount),
    };
  }

  if (event.type === "navigate") {
    resolveRoute(definition.routes, event.routeId);
    return alignNavigationToRoute(definition, navigateToRoute(state, event.routeId, event.transition ?? "push"));
  }

  if (event.type === "menu") {
    const menu = definition.menus?.find((candidate) => candidate.id === event.menuId);
    if (!menu) throw new Error(`Unknown prettui menu id: ${event.menuId}`);
    return {
      ...state,
      activeMenuId: menu.id,
      menuItemIndex: clampMenuItemIndex(menu, state.menuItemIndex),
      focusZone: normalizeFocusZone(zones, "menu"),
      transition: startTransition({ kind: event.transition ?? "menu", fromRouteId: state.routeId, toRouteId: state.routeId }),
    };
  }

  if (event.type === "back") return alignNavigationToRoute(definition, goBack(state));
  if (event.type !== "key") return state;

  if (event.key === "tab") return { ...state, focusZone: moveFocusZone(zones, state.focusZone, 1) };
  if (event.key === "shift-tab") return { ...state, focusZone: moveFocusZone(zones, state.focusZone, -1) };
  if (event.key === "escape" || event.key === "back") return alignNavigationToRoute(definition, goBack(state));

  if (state.focusZone === "navigation") {
    if (event.key === "up") return { ...state, navigationRowIndex: clampNavigationRowIndex(rows, state.navigationRowIndex - 1) };
    if (event.key === "down") return { ...state, navigationRowIndex: clampNavigationRowIndex(rows, state.navigationRowIndex + 1) };
    if (event.key === "left") {
      const row = rows[state.navigationRowIndex];
      if (row?.kind !== "section" || !row.expanded) return state;
      return selectNavigationRow(definition, state, row);
    }
    if (event.key === "right" || event.key === "enter" || event.key === "space") {
      return selectNavigationRow(definition, state, rows[state.navigationRowIndex]);
    }
    return state;
  }

  if (state.focusZone === "menu") {
    if (event.key === "up") return { ...state, menuItemIndex: clampMenuItemIndex(activeMenu, state.menuItemIndex - 1) };
    if (event.key === "down") return { ...state, menuItemIndex: clampMenuItemIndex(activeMenu, state.menuItemIndex + 1) };
    if (event.key === "left") return { ...state, focusZone: normalizeFocusZone(zones, "main") };
    if (event.key === "enter" || event.key === "space" || event.key === "right") {
      const item = selectedMenuItem(definition, state);
      if (!item?.routeId || item.disabled) return state;
      resolveRoute(definition.routes, item.routeId);
      return alignNavigationToRoute(definition, navigateToRoute(state, item.routeId, "menu"));
    }
    return state;
  }

  if (event.key === "left") return { ...state, focusZone: normalizeFocusZone(zones, "navigation") };
  if (event.key === "right" && activeMenu) return { ...state, focusZone: normalizeFocusZone(zones, "menu") };
  return state;
}

function renderNavigationShell<TContext>(
  definition: TuiAppDefinition<TContext>,
  state: TuiAppState,
  width: number,
  height: number,
  color: boolean
): string {
  const rows = buildNavigationRows(definition.navigation, state.expandedSectionIds);
  const inner = Math.max(1, width - 4);
  const lines: string[] = [rgb("NAVIGATION", theme.green, color)];

  for (const [index, row] of rows.entries()) {
    const selected = state.focusZone === "navigation" && index === state.navigationRowIndex;
    if (row.kind === "section") {
      const marker = row.expanded ? "v" : ">";
      const label = `${marker} ${row.label}`;
      lines.push(selected ? selectedLine(label, inner, color) : rgb(label, theme.cyan, color));
      continue;
    }

    const active = row.item.routeId === state.routeId;
    const indent = " ".repeat(row.depth * 2 + 1);
    const icon = row.item.icon ? `${row.item.icon} ` : "";
    const disabled = row.item.disabled ? dim(row.item.label, color) : row.item.label;
    const label = `${indent}${icon}${disabled}${active ? " >" : ""}`;
    lines.push(selected ? selectedLine(label, inner, color) : active ? rgb(label, theme.green, color) : label);
  }

  lines.push(divider(inner, color));
  lines.push(rgb("ROUTING", theme.green, color));
  lines.push(renderKeyValueRow("Route", state.routeId, inner, color));
  lines.push(renderKeyValueRow("History", String(state.history.length), inner, color));

  return renderPanel({
    children: lines,
    width,
    height,
    color,
    paddingX: 1,
    accent: state.focusZone === "navigation" ? theme.cyan : undefined,
  });
}

function renderMenuShell(menu: TuiMenu | undefined, state: TuiAppState, width: number, height: number, color: boolean): string {
  const inner = Math.max(1, width - 4);
  const lines: string[] = [rgb("MENU", theme.green, color)];

  if (!menu) {
    lines.push(dim("No menu registered.", color));
  } else {
    lines.push(dim(menu.label, color));
    for (const [index, item] of menu.items.entries()) {
      const selected = state.focusZone === "menu" && index === state.menuItemIndex;
      const value = item.value ? dim(` ${item.value}`, color) : "";
      const label = `${item.label}${value}`;
      const line = item.disabled ? dim(label, color) : item.tone ? rgb(label, theme[item.tone], color) : label;
      lines.push(selected ? selectedLine(line, inner, color) : line);
      if (selected && item.description) lines.push(dim(`  ${truncate(item.description, inner - 2)}`, color));
    }
  }

  lines.push(divider(inner, color));
  lines.push(rgb("TRANSITION", theme.green, color));
  lines.push(renderKeyValueRow("Kind", state.transition?.kind ?? "idle", inner, color));
  lines.push(renderKeyValueRow("Phase", state.transition?.phase ?? "idle", inner, color));

  return renderPanel({
    title: "Menu",
    children: lines,
    width,
    height,
    color,
    paddingX: 1,
    accent: state.focusZone === "menu" ? theme.cyan : undefined,
  });
}

function renderMainShell<TContext>(
  definition: TuiAppDefinition<TContext>,
  route: TuiRouteDefinition<TContext>,
  state: TuiAppState,
  width: number,
  height: number,
  color: boolean
): string {
  const contentWidth = Math.max(1, width - 4);
  const contentHeight = Math.max(0, height - 2);
  const rendered = route.render({
    width: contentWidth,
    height: contentHeight,
    color,
    route,
    state,
    context: definition.context,
  });
  const title = state.focusZone === "main" ? `${route.title} *` : route.title;

  return renderPanel({
    title,
    children: normalizeFrame(rendered, contentWidth, contentHeight).split("\n"),
    width,
    height,
    color,
    paddingX: 1,
    accent: state.focusZone === "main" ? theme.cyan : undefined,
  });
}

export function renderTuiApp<TContext>(definition: TuiAppDefinition<TContext>, state: TuiAppState, options: TuiRenderOptions): string {
  const width = Math.max(20, Math.floor(options.width));
  const height = Math.max(6, Math.floor(options.height));
  const color = options.color ?? true;
  const syncedState = syncStateAfterRoute(definition, state);
  const route = resolveRoute(definition.routes, syncedState.routeId);
  const activeMenu = activeMenuForRoute(definition, route, syncedState.activeMenuId);
  const footerHeight = height >= 10 ? 3 : 0;
  const headerHeight = height - footerHeight >= 8 ? 5 : Math.max(0, Math.min(2, height - footerHeight));
  const bodyHeight = Math.max(0, height - headerHeight - footerHeight);
  const status = [
    definition.version ? dim(`v${definition.version}`, color) : "",
    `route ${route.id}`,
    `focus ${syncedState.focusZone}`,
    syncedState.transition ? `transition ${syncedState.transition.kind}:${syncedState.transition.phase}` : "transition idle",
  ].filter(Boolean);

  const header = normalizeFrame(
    renderBrandHeader({
      title: definition.title,
      subtitle: definition.subtitle,
      status,
      width,
      color,
    }),
    width,
    headerHeight
  );

  const showNavigation = width >= 82 && bodyHeight >= 8;
  const showMenu = Boolean(activeMenu) && width >= 118 && bodyHeight >= 8;
  const gap = showNavigation || showMenu ? 2 : 0;
  const panelWidths =
    showNavigation && showMenu
      ? splitRatioWidths(width, [0.24, 0.5, 0.26], gap, [24, 42, 24])
      : showNavigation
        ? splitRatioWidths(width, [0.3, 0.7], gap, [24, 42])
        : [width];
  const mainWidth = showNavigation ? (panelWidths[1] ?? width) : (panelWidths[0] ?? width);
  const panels: string[] = [];

  if (showNavigation) panels.push(renderNavigationShell(definition, syncedState, panelWidths[0] ?? 24, bodyHeight, color));
  panels.push(renderMainShell(definition, route, syncedState, mainWidth, bodyHeight, color));
  if (showMenu) panels.push(renderMenuShell(activeMenu, syncedState, panelWidths[2] ?? 24, bodyHeight, color));

  const body = normalizeFrame(hstack(panels, gap), width, bodyHeight);
  const footerStatus: FooterItem[] = [
    { label: "Route", value: route.title, tone: "green" },
    { label: "Focus", value: syncedState.focusZone, tone: "cyan" },
    ...(activeMenu ? [{ label: "Menu", value: activeMenu.label, tone: "amber" } satisfies FooterItem] : []),
    ...(definition.footerStatus?.({ state: syncedState, route, context: definition.context }) ?? []),
  ];
  const controls = [...(route.footerControls ?? ["[tab] Focus", "[up/down] Move", "[enter] Open", "[esc] Back"])];
  const footer =
    footerHeight > 0 ? normalizeFrame(renderFooter({ status: footerStatus, controls, width, color }), width, footerHeight) : "";

  return normalizeFrame([header, body, footer].filter(Boolean).join("\n"), width, height);
}

export function renderRouteSummary(route: TuiRouteDefinition<unknown>, width: number, color = true): string {
  return joinAligned(rgb(route.title, theme.green, color), dim(route.description ?? route.id, color), width);
}
