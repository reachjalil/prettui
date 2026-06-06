import { describe, expect, it } from "vitest";
import { renderPanel, stripAnsi, visibleLength } from "@prettui/kit";
import { buildNavigationRows, createTuiAppState, reduceTuiAppEvent, renderTuiApp, type TuiAppDefinition } from "@prettui/framework";

type SampleContext = {
  queueDepth: number;
  incidents: string[];
};

const sampleApp: TuiAppDefinition<SampleContext> = {
  title: "prettui",
  subtitle: "Typed operations console",
  version: "0.1.0",
  initialRouteId: "overview",
  context: {
    queueDepth: 12,
    incidents: ["api latency", "worker retry"],
  },
  navigation: [
    {
      id: "workspace",
      label: "Workspace",
      items: [
        { id: "overview", label: "Overview", routeId: "overview", icon: "*" },
        { id: "queues", label: "Queues", routeId: "queues", icon: "#" },
      ],
    },
    {
      id: "guides",
      label: "Guides",
      defaultExpanded: false,
      items: [{ id: "routing", label: "Routing", routeId: "routing", icon: ">" }],
    },
  ],
  menus: [
    {
      id: "variants",
      label: "Variants",
      items: [
        { id: "live", label: "Live data", routeId: "overview", value: "dynamic", tone: "green" },
        { id: "queues", label: "Queue detail", routeId: "queues", value: "drill-in", tone: "amber" },
      ],
    },
  ],
  footerStatus: ({ context }) => [{ label: "Queue", value: String(context.queueDepth), tone: "amber" }],
  routes: [
    {
      id: "overview",
      title: "Overview",
      description: "Live summary",
      menuId: "variants",
      render: ({ width, height, context, color }) =>
        renderPanel({
          title: "Live Summary",
          children: [`Queue depth: ${context.queueDepth}`, `Incidents: ${context.incidents.length}`],
          width,
          height,
          color,
        }),
    },
    {
      id: "queues",
      title: "Queues",
      description: "Worker lanes",
      menuId: "variants",
      render: ({ width, height, color }) =>
        renderPanel({
          title: "Queue Detail",
          children: ["ingest", "enrich", "export"],
          width,
          height,
          color,
        }),
    },
    {
      id: "routing",
      title: "Routing",
      description: "Route model",
      render: ({ width, height, color }) =>
        renderPanel({
          title: "Route Guide",
          children: ["Routes are typed.", "History is explicit."],
          width,
          height,
          color,
        }),
    },
  ],
};

describe("prettui framework", () => {
  it("renders an exact-frame app shell with navigation, main content, menu, and footer", () => {
    const state = createTuiAppState(sampleApp);
    const frame = renderTuiApp(sampleApp, state, { width: 120, height: 32, color: false });
    const text = stripAnsi(frame);
    const lines = frame.split("\n");

    expect(lines).toHaveLength(32);
    expect(lines.every((line) => visibleLength(line) === 120)).toBe(true);
    expect(text).toContain("Typed operations console");
    expect(text).toContain("NAVIGATION");
    expect(text).toContain("Overview");
    expect(text).toContain("Live Summary");
    expect(text).toContain("MENU");
    expect(text).toContain("Queue depth: 12");
  });

  it("moves focus independently from route selection", () => {
    let state = createTuiAppState(sampleApp);

    state = reduceTuiAppEvent(sampleApp, state, { type: "key", key: "down" });
    expect(state.navigationRowIndex).toBe(2);

    state = reduceTuiAppEvent(sampleApp, state, { type: "key", key: "tab" });
    expect(state.focusZone).toBe("main");

    state = reduceTuiAppEvent(sampleApp, state, { type: "key", key: "shift-tab" });
    expect(state.focusZone).toBe("navigation");
    expect(state.navigationRowIndex).toBe(2);
  });

  it("routes through navigation and preserves explicit history", () => {
    let state = createTuiAppState(sampleApp);
    state = reduceTuiAppEvent(sampleApp, state, { type: "navigate", routeId: "queues" });

    expect(state.routeId).toBe("queues");
    expect(state.history).toEqual(["overview"]);
    expect(state.transition).toMatchObject({ kind: "push", fromRouteId: "overview", toRouteId: "queues", phase: "enter" });

    state = reduceTuiAppEvent(sampleApp, state, { type: "back" });
    expect(state.routeId).toBe("overview");
    expect(state.history).toEqual([]);
    expect(state.transition).toMatchObject({ kind: "back", fromRouteId: "queues", toRouteId: "overview" });
  });

  it("toggles expandable navigation sections", () => {
    let state = createTuiAppState(sampleApp);
    const initialRows = buildNavigationRows(sampleApp.navigation, state.expandedSectionIds);
    expect(stripAnsi(initialRows.map((row) => (row.kind === "section" ? row.label : row.item.label)).join(" "))).toContain("Guides");

    state = { ...state, navigationRowIndex: 3 };
    state = reduceTuiAppEvent(sampleApp, state, { type: "key", key: "space" });

    expect(state.expandedSectionIds).toContain("guides");
    expect(
      buildNavigationRows(sampleApp.navigation, state.expandedSectionIds).some((row) => row.kind === "item" && row.item.id === "routing")
    ).toBe(true);
  });

  it("routes through menu selections and advances transition ticks", () => {
    let state = createTuiAppState(sampleApp, { focusZone: "menu", menuItemIndex: 1 });

    state = reduceTuiAppEvent(sampleApp, state, { type: "key", key: "enter" });
    expect(state.routeId).toBe("queues");
    expect(state.transition).toMatchObject({ kind: "menu", fromRouteId: "overview", toRouteId: "queues", phase: "enter", tick: 0 });

    state = reduceTuiAppEvent(sampleApp, state, { type: "tick" });
    expect(state.transition).toMatchObject({ kind: "menu", phase: "idle", tick: 1 });
  });
});
