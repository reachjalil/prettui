import { describe, expect, it } from "vitest";
import {
  renderFooter,
  renderSummaryCards,
  renderTuiDashboard,
  segmentedDonut,
  stripAnsi,
  visibleLength,
  type TuiDashboardProps,
} from "@prettui/kit";

const sampleDashboard: TuiDashboardProps = {
  width: 178,
  height: 48,
  color: false,
  brand: {
    title: "prettui",
    subtitle: "terminal automation realtime analytics TUI",
    workspace: "~/projects/example",
    profile: "default",
  },
  metrics: [
    { title: "SESSIONS (LIVE)", value: "3", delta: "↑ 2 in last 30m", tone: "green", sparkValues: [1, 2, 3, 2, 4] },
    { title: "ACTIVE HOOKS", value: "14", delta: "↑ 4 vs 30m ago", tone: "red", sparkValues: [4, 3, 5, 3, 2] },
    { title: "APPROVALS WAITING", value: "2", delta: "↓ 1 vs 30m ago", tone: "amber", spark: "dash" },
  ],
  navigation: {
    items: [{ icon: "⌂", label: "Overview", active: true }],
    filters: [{ label: "Risk", value: "All" }],
  },
  events: [
    {
      time: "13:35:12.625",
      event: "PostCompact",
      session: "sess_01H8Z4J7E8",
      turn: "12",
      tool: "-",
      risk: "LOW",
      duration: "70ms",
      tone: "green",
    },
  ],
  inspector: {
    title: "EVENT INSPECTOR",
    id: "evt_01H8Z4J7E8_0000C1F6",
    value: { hook_event_name: "PostCompact", risk: "low" },
    riskMix: {
      total: "422",
      subLabel: "Risk",
      segments: [
        { label: "Low", value: 312, color: [55, 214, 123] },
        { label: "Medium", value: 86, color: [246, 199, 75] },
        { label: "High", value: 24, color: [255, 97, 89] },
      ],
      legend: ["Low 312 74%", "Medium 86 20%", "High 24 6%"],
    },
  },
  files: [
    {
      time: "13:35:12",
      kind: "MODIFIED",
      path: "app/server.ts",
      delta: "+842 -128",
      fileType: "TypeScript",
      summary: "Edited request handler",
    },
  ],
  footer: {
    status: [{ label: "Status", value: "● Connected", tone: "green" }],
    controls: ["[q] Quit", "[/] Search"],
  },
};

describe("prettui", () => {
  it("renders dashboard frames at exact width and height", () => {
    const frame = renderTuiDashboard(sampleDashboard);
    const lines = frame.split("\n");
    expect(lines).toHaveLength(48);
    expect(lines.every((line) => visibleLength(line) === 178)).toBe(true);
    expect(stripAnsi(frame)).toContain("EVENT STREAM");
    expect(stripAnsi(frame)).toContain("EVENT INSPECTOR");
  });

  it("keeps required dashboard panels visible in compact terminal sizes", () => {
    const frame = renderTuiDashboard({ ...sampleDashboard, width: 72, height: 28 });
    const text = stripAnsi(frame);

    expect(frame.split("\n")).toHaveLength(28);
    expect(text).toContain("EVENT STREAM");
    expect(text).toContain("[q] Quit");
  });

  it("renders summary cards as reusable components", () => {
    const cards = renderSummaryCards(sampleDashboard.metrics, 90, false);
    expect(stripAnsi(cards)).toContain("SESSIONS (LIVE)");
    expect(cards.split("\n").every((line) => visibleLength(line) === 90)).toBe(true);
  });

  it("renders braille segmented donuts", () => {
    const donut = segmentedDonut(sampleDashboard.inspector.riskMix?.segments ?? [], {
      width: 14,
      height: 6,
      centerLabel: "422",
      centerSubLabel: "Risk",
      color: false,
    });
    expect(donut.join("\n")).toMatch(/[\u2801-\u28ff]/u);
    expect(donut.join("\n")).toContain("422");
  });

  it("renders footer controls without app-specific behavior", () => {
    const footer = renderFooter({ ...sampleDashboard.footer, width: 80, color: false });
    expect(stripAnsi(footer)).toContain("[q] Quit");
  });
});
