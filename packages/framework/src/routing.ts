import type { TuiAppState, TuiRouteDefinition, TuiTransitionKind } from "./types";
import { startTransition } from "./transitions";

export function createRouteMap<TContext>(routes: readonly TuiRouteDefinition<TContext>[]): Map<string, TuiRouteDefinition<TContext>> {
  if (routes.length === 0) throw new Error("prettui app definitions need at least one route.");
  const map = new Map<string, TuiRouteDefinition<TContext>>();
  for (const route of routes) {
    if (map.has(route.id)) throw new Error(`Duplicate prettui route id: ${route.id}`);
    map.set(route.id, route);
  }
  return map;
}

export function resolveRoute<TContext>(routes: readonly TuiRouteDefinition<TContext>[], routeId: string): TuiRouteDefinition<TContext> {
  const route = createRouteMap(routes).get(routeId);
  if (!route) throw new Error(`Unknown prettui route id: ${routeId}`);
  return route;
}

export function navigateToRoute(state: TuiAppState, routeId: string, kind: TuiTransitionKind = "push"): TuiAppState {
  if (state.routeId === routeId && kind !== "replace") return state;
  const history = kind === "push" && state.routeId !== routeId ? [...state.history, state.routeId] : state.history;
  return {
    ...state,
    routeId,
    history,
    transition: startTransition({ kind, fromRouteId: state.routeId, toRouteId: routeId }),
  };
}

export function goBack(state: TuiAppState): TuiAppState {
  const routeId = state.history.at(-1);
  if (!routeId) return state;
  return {
    ...state,
    routeId,
    history: state.history.slice(0, -1),
    transition: startTransition({ kind: "back", fromRouteId: state.routeId, toRouteId: routeId }),
  };
}
