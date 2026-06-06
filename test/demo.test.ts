import { describe, expect, it } from "vitest";
import { stripAnsi, visibleLength } from "@prettui/kit";
import { renderTuiDemo } from "@prettui/demo";
import { kitchenSinkComponentIndexById } from "@prettui/demo";

describe("prettui demo", () => {
  it("renders the five-choice launcher by default", () => {
    const frame = renderTuiDemo({ width: 120, height: 32, color: false });
    const lines = frame.split("\n");

    expect(lines).toHaveLength(32);
    expect(lines.every((line) => visibleLength(line) === 120)).toBe(true);
    expect(stripAnsi(frame)).toContain("Choose a TUI demo");
    expect(stripAnsi(frame)).toContain("mock1");
    expect(stripAnsi(frame)).toContain("mock4");
    expect(stripAnsi(frame)).toContain("kitchen-sink");
  });

  it("renders the mock2 dashboard through prettui layout elements", () => {
    const frame = renderTuiDemo({ width: 178, height: 48, color: false, choice: "mock2" });
    const lines = frame.split("\n");
    expect(lines).toHaveLength(48);
    expect(lines.every((line) => visibleLength(line) === 178)).toBe(true);
    expect(stripAnsi(frame)).toContain("terminal automation realtime analytics TUI");
    expect(stripAnsi(frame)).toContain("EVENT STREAM (LIVE)");
    expect(stripAnsi(frame)).toContain("EVENT INSPECTOR");
    expect(stripAnsi(frame)).toContain("FILE WATCHER");
    expect(stripAnsi(frame)).toContain("RISK MIX");
  });

  it("keeps the demo bounded across responsive terminal widths", () => {
    for (const choice of ["mock1", "mock2", "mock3", "mock4", "kitchen-sink"] as const) {
      for (const [width, height] of [
        [72, 28],
        [120, 36],
        [178, 48],
      ] as const) {
        const frame = renderTuiDemo({ width, height, color: false, choice });
        const lines = frame.split("\n");
        expect(lines).toHaveLength(height);
        expect(lines.every((line) => visibleLength(line) === width)).toBe(true);
        expect(stripAnsi(frame)).toContain("[q] Quit");
      }
    }
  });

  it("renders the kitchen sink with component navigation, preview, and select options", () => {
    const frame = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      interaction: {
        selectedEventIndex: 3,
        eventFilter: "High",
      },
    });
    const text = stripAnsi(frame);

    expect(frame.split("\n")).toHaveLength(48);
    expect(text).toContain("TUI component kitchen sink");
    expect(text).toContain("Navigation");
    expect(text).toContain("Event Stream");
    expect(text).toContain("Layout Patterns");
    expect(text).toContain("Data Visualization");
    expect(text).toContain("OPTIONS");
    expect(text).toContain("Tab focus. j/k field.");
    expect(text).toContain("DATA");
    expect(text).toContain("[Static]");
    expect(text).toContain("VARIANT");
    expect(text).toContain("[tab] Focus");
    expect(text).toContain("[f/space] Toggle");
  });

  it("renders grouped kitchen sink navigation with collapsible sections", () => {
    const frame = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      interaction: {
        kitchenSinkExpandedSectionMask: 0b001001,
        kitchenSinkNavRowIndex: 3,
      },
    });
    const text = stripAnsi(frame);

    expect(text).toContain("▾ Core Components");
    expect(text).toContain("▸ Layout Patterns");
    expect(text).toContain("▸ Data Surfaces");
    expect(text).toContain("▾ Data Visualization");
    expect(text).toContain("▸ Best Practices");
    expect(text).toContain("Open  2 / 6");
  });

  it("renders advanced layout guide previews from the kitchen sink", () => {
    const masterDetail = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      tick: 6,
      interaction: {
        kitchenSinkComponentIndex: kitchenSinkComponentIndexById("layout-master-detail"),
        kitchenSinkFocus: "options",
        kitchenSinkDataIndex: 1,
        kitchenSinkVariantIndex: 1,
        kitchenSinkDensityIndex: 2,
      },
    });
    const scrollContract = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      interaction: {
        kitchenSinkComponentIndex: kitchenSinkComponentIndexById("layout-scroll-contract"),
        kitchenSinkFocus: "options",
      },
    });

    expect(stripAnsi(masterDetail)).toContain("Master Detail Guide");
    expect(stripAnsi(masterDetail)).toContain("Inspector");
    expect(stripAnsi(masterDetail)).toContain("FOCUS CONTRACT");
    expect(stripAnsi(masterDetail)).toContain("[Dynamic]");
    expect(stripAnsi(masterDetail)).toContain("[Large]");
    expect(stripAnsi(scrollContract)).toContain("SCROLL OWNERS");
    expect(stripAnsi(scrollContract)).toContain("Root fixed");
  });

  it("renders best-practice guide previews for advanced TUI implementation", () => {
    const keyboard = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      interaction: {
        kitchenSinkComponentIndex: kitchenSinkComponentIndexById("practice-keyboard-model"),
        kitchenSinkFocus: "options",
        kitchenSinkVariantIndex: 2,
      },
    });
    const statePatterns = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      interaction: {
        kitchenSinkComponentIndex: kitchenSinkComponentIndexById("practice-state-patterns"),
        kitchenSinkFocus: "options",
        kitchenSinkVariantIndex: 1,
      },
    });

    expect(stripAnsi(keyboard)).toContain("Keyboard Model Guide");
    expect(stripAnsi(keyboard)).toContain("KEY CONTRACT");
    expect(stripAnsi(keyboard)).toContain("[Global]");
    expect(stripAnsi(statePatterns)).toContain("State Patterns Guide");
    expect(stripAnsi(statePatterns)).toContain("Loading State");
    expect(stripAnsi(statePatterns)).toContain("[Loading]");
  });

  it("renders primitive graph previews from the data visualization group", () => {
    const frame = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      tick: 5,
      interaction: {
        kitchenSinkComponentIndex: kitchenSinkComponentIndexById("bar-chart"),
        kitchenSinkFocus: "options",
        kitchenSinkDataIndex: 1,
        kitchenSinkVariantIndex: 2,
        kitchenSinkDensityIndex: 2,
      },
    });
    const text = stripAnsi(frame);

    expect(text).toContain("Bar Chart");
    expect(text).toContain("Stacked comparison");
    expect(text).toContain("[Dynamic]");
    expect(text).toContain("[Stacked]");
    expect(text).toContain("[Large]");
  });

  it("renders the expanded graph visualization set", () => {
    const previews = [
      { id: "area-chart", expected: "Area Chart", variant: 2, marker: "Area comparison" },
      { id: "gauge-chart", expected: "Gauge Chart", variant: 2, marker: "Multiple gauges" },
      { id: "histogram-chart", expected: "Histogram", variant: 1, marker: "Duration buckets" },
      { id: "scatter-plot", expected: "Scatter Plot", variant: 2, marker: "Latency / risk" },
      { id: "distribution-bars", expected: "Distribution Bars", variant: 1, marker: "Distribution" },
      { id: "matrix-grid", expected: "Matrix Grid", variant: 1, marker: "File activity matrix" },
    ] as const;

    for (const preview of previews) {
      const frame = renderTuiDemo({
        width: 178,
        height: 48,
        color: false,
        choice: "kitchen-sink",
        tick: 5,
        interaction: {
          kitchenSinkComponentIndex: kitchenSinkComponentIndexById(preview.id),
          kitchenSinkFocus: "options",
          kitchenSinkDataIndex: 1,
          kitchenSinkVariantIndex: preview.variant,
          kitchenSinkDensityIndex: 2,
        },
      });
      const text = stripAnsi(frame);

      expect(text).toContain(preview.expected);
      expect(text).toContain(preview.marker);
      expect(text).toContain("[Dynamic]");
      expect(text).toContain("[Large]");
    }
  });

  it("renders kitchen sink focus and dynamic sample data state", () => {
    const firstFrame = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      tick: 0,
      interaction: {
        kitchenSinkFocus: "options",
        kitchenSinkComponentIndex: kitchenSinkComponentIndexById("key-value-widget"),
        kitchenSinkOptionGroupIndex: 1,
        kitchenSinkVariantIndex: 1,
        kitchenSinkDataIndex: 1,
        kitchenSinkDensityIndex: 2,
      },
    });
    const secondFrame = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "kitchen-sink",
      tick: 4,
      interaction: {
        kitchenSinkFocus: "options",
        kitchenSinkComponentIndex: kitchenSinkComponentIndexById("key-value-widget"),
        kitchenSinkOptionGroupIndex: 1,
        kitchenSinkVariantIndex: 1,
        kitchenSinkDataIndex: 1,
        kitchenSinkDensityIndex: 2,
      },
    });
    const text = stripAnsi(firstFrame);

    expect(text).toContain("Focus: Options");
    expect(text).toContain("[Perf]");
    expect(text).toContain("Dynamic");
    expect(text).toContain("Large");
    expect(secondFrame).not.toEqual(firstFrame);
  });

  it("updates live values when the demo tick advances", () => {
    const firstFrame = renderTuiDemo({ width: 178, height: 48, color: false, choice: "mock2", tick: 0 });
    const secondFrame = renderTuiDemo({ width: 178, height: 48, color: false, choice: "mock2", tick: 4 });

    expect(secondFrame).not.toEqual(firstFrame);
    expect(stripAnsi(secondFrame)).toContain("evt_01H8Z4J7E8_00000004");
    expect(stripAnsi(secondFrame)).toContain("Events: 1,263");
  });

  it("renders shortcut state for filtering, search, panel focus, and selection", () => {
    const frame = renderTuiDemo({
      width: 178,
      height: 48,
      color: false,
      choice: "mock2",
      interaction: {
        activePanel: "inspector",
        eventFilter: "Medium",
        searchQuery: "Bash",
        selectedEventIndex: 1,
      },
    });
    const text = stripAnsi(frame);

    expect(text).toContain("Filter: Medium / Bash");
    expect(text).toContain("[/] Search:Bash");
    expect(text).toContain("[tab] Focus:Event Inspector");
    expect(text).toContain("[j/k] Event:2/2");
    expect(text).toContain('"tool_name": "Bash"');
  });
});
