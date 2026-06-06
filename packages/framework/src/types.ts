import type { Tone } from "@prettui/core";
import type { FooterItem } from "@prettui/components";

export type TuiKey = "tab" | "shift-tab" | "up" | "down" | "left" | "right" | "enter" | "space" | "escape" | "back" | "unknown";

export type TuiTransitionKind = "replace" | "push" | "back" | "modal" | "menu";

export type TuiTransitionPhase = "enter" | "idle";

export type TuiTransitionState = {
  kind: TuiTransitionKind;
  fromRouteId?: string;
  toRouteId: string;
  phase: TuiTransitionPhase;
  tick: number;
};

export type TuiAppEvent =
  | { type: "key"; key: TuiKey }
  | { type: "navigate"; routeId: string; transition?: TuiTransitionKind }
  | { type: "menu"; menuId: string; transition?: TuiTransitionKind }
  | { type: "back" }
  | { type: "tick"; amount?: number };

export type TuiNavigationItem = {
  id: string;
  label: string;
  routeId?: string;
  icon?: string;
  disabled?: boolean;
  children?: readonly TuiNavigationItem[];
};

export type TuiNavigationSection = {
  id: string;
  label: string;
  items: readonly TuiNavigationItem[];
  defaultExpanded?: boolean;
};

export type TuiNavigationRow =
  | {
      kind: "section";
      sectionId: string;
      label: string;
      expanded: boolean;
      sectionIndex: number;
    }
  | {
      kind: "item";
      sectionId: string;
      item: TuiNavigationItem;
      itemIndex: number;
      depth: number;
    };

export type TuiMenuItem = {
  id: string;
  label: string;
  description?: string;
  routeId?: string;
  disabled?: boolean;
  value?: string;
  tone?: Tone;
};

export type TuiMenu = {
  id: string;
  label: string;
  items: readonly TuiMenuItem[];
};

export type TuiAppState = {
  routeId: string;
  history: string[];
  focusZone: string;
  expandedSectionIds: string[];
  navigationRowIndex: number;
  activeMenuId?: string;
  menuItemIndex: number;
  transition?: TuiTransitionState;
};

export type TuiRouteRenderArgs<TContext> = {
  width: number;
  height: number;
  color: boolean;
  route: TuiRouteDefinition<TContext>;
  state: TuiAppState;
  context: TContext;
};

export type TuiRouteDefinition<TContext = undefined> = {
  id: string;
  title: string;
  description?: string;
  menuId?: string;
  render: (args: TuiRouteRenderArgs<TContext>) => string;
  footerControls?: readonly string[];
};

export type TuiAppDefinition<TContext = undefined> = {
  title: string;
  subtitle: string;
  version?: string;
  routes: readonly TuiRouteDefinition<TContext>[];
  navigation: readonly TuiNavigationSection[];
  initialRouteId: string;
  focusZones?: readonly string[];
  menus?: readonly TuiMenu[];
  initialMenuId?: string;
  context: TContext;
  footerStatus?: (args: { state: TuiAppState; route: TuiRouteDefinition<TContext>; context: TContext }) => FooterItem[];
};

export type TuiRenderOptions = {
  width: number;
  height: number;
  color?: boolean;
};
