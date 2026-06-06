export const defaultFocusZones = ["navigation", "main", "menu"] as const;

export function normalizeFocusZone(zones: readonly string[], value: string | undefined): string {
  if (zones.length === 0) return "main";
  if (value && zones.includes(value)) return value;
  return zones[0] ?? "main";
}

export function moveFocusZone(zones: readonly string[], current: string, delta: number): string {
  if (zones.length === 0) return "main";
  const currentIndex = Math.max(0, zones.indexOf(current));
  const nextIndex = (currentIndex + delta + zones.length) % zones.length;
  return zones[nextIndex] ?? zones[0] ?? "main";
}
