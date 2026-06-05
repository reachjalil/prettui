import type { TuiTransitionKind, TuiTransitionState } from "./types";

export function startTransition(input: { kind: TuiTransitionKind; fromRouteId?: string; toRouteId: string }): TuiTransitionState {
  return {
    kind: input.kind,
    fromRouteId: input.fromRouteId,
    toRouteId: input.toRouteId,
    phase: "enter",
    tick: 0,
  };
}

export function advanceTransition(transition: TuiTransitionState | undefined, amount = 1): TuiTransitionState | undefined {
  if (!transition) return undefined;
  const tick = transition.tick + Math.max(1, Math.floor(amount));
  return {
    ...transition,
    tick,
    phase: tick >= 1 ? "idle" : "enter",
  };
}
