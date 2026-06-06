import { theme } from "@prettui/core";
import type { TuiDashboardProps } from "@prettui/dashboard";

const spark = [4, 6, 5, 7, 6, 9, 8, 5, 7, 3, 4, 2, 5, 2, 6, 2, 3, 1];

export type TuiDemoDashboardData = Omit<TuiDashboardProps, "width" | "height" | "color">;

export const mock2Dashboard: TuiDemoDashboardData = {
  brand: {
    title: "prettui",
    subtitle: "terminal automation realtime analytics TUI",
    version: "v0.1.0",
    connected: true,
    workspace: "~/projects/example",
    profile: "default",
  },
  metrics: [
    { title: "SESSIONS (LIVE)", value: "3", delta: "↑ 2 in last 30m", tone: "green", sparkValues: spark },
    { title: "ACTIVE HOOKS", value: "14", delta: "↑ 4 vs 30m ago", tone: "red", sparkValues: spark.slice().reverse() },
    { title: "APPROVALS WAITING", value: "2", delta: "↓ 1 vs 30m ago", tone: "amber", spark: "dash" },
    { title: "TOOL CALLS TODAY", value: "156", delta: "↑ 23% vs yesterday", tone: "cyan", spark: "bars", sparkValues: spark },
    { title: "FILE MODIFICATIONS", value: "38", delta: "↑ 18% vs yesterday", tone: "lime", sparkValues: spark.slice(2) },
    {
      title: "RISK ALERTS (24H)",
      value: "5",
      delta: "↓ 2 vs yesterday",
      tone: "white",
      spark: "lowBars",
      sparkValues: spark.slice().reverse(),
    },
  ],
  navigation: {
    items: [
      { icon: "⌂", label: "Overview", active: true },
      { icon: "⌘", label: "Hooks" },
      { icon: "⚒", label: "Tools" },
      { icon: "▣", label: "Files" },
      { icon: "◇", label: "Risk" },
      { icon: "✓", label: "Approvals" },
      { icon: "☷", label: "Sessions" },
    ],
    filters: [
      { label: "Session", value: "Main" },
      { label: "Hook", value: "All" },
      { label: "Tool", value: "All" },
      { label: "Risk", value: "All" },
      { label: "Decision", value: "All" },
      { label: "Since", value: "30m ago" },
    ],
  },
  events: [
    ["13:35:12.625", "PostCompact", "sess_01H8Z4J7E8", "12", "-", "LOW", "70ms", "green"],
    ["13:35:11.959", "PostToolUse", "sess_01H8Z4J7E8", "12", "ReadFile", "LOW", "57ms", "green"],
    ["13:35:11.708", "PreToolUse", "sess_01H8Z4J7E8", "12", "ReadFile", "LOW", "31ms", "cyan"],
    ["13:35:10.394", "PermissionRequest", "sess_01H8Z4J7E8", "12", "ReadFile", "LOW", "64ms", "amber"],
    ["13:35:08.837", "UserPromptSubmit", "sess_01H8Z4J7E8", "11", "-", "LOW", "-", "purple"],
    ["13:35:08.267", "SessionStart", "sess_01H8Z4J7E8", "11", "-", "LOW", "-", "lime"],
    ["13:35:07.053", "Stop", "sess_01H8Z4J7E8", "11", "-", "LOW", "-", "red"],
    ["13:35:05.838", "PostCompact", "sess_01H8Z4J7E8", "11", "-", "LOW", "62ms", "green"],
    ["13:35:05.607", "PostToolUse", "sess_01H8Z4J7E8", "11", "Glob", "LOW", "50ms", "green"],
    ["13:35:03.168", "PreToolUse", "sess_01H8Z4J7E8", "1", "Glob", "LOW", "28ms", "cyan"],
    ["13:35:02.817", "UserPromptSubmit", "sess_01H7Y9C3D2", "8", "-", "LOW", "-", "purple"],
    ["13:35:02.046", "SessionStart", "sess_01H7Y9C3D2", "8", "-", "LOW", "-", "lime"],
    ["13:35:01.720", "Stop", "sess_01H7Y9C3D2", "8", "-", "LOW", "-", "red"],
    ["13:34:58.955", "PermissionRequest", "sess_01H7Y9C3D2", "8", "Bash", "MED", "92ms", "amber"],
    ["13:34:56.843", "PreToolUse", "sess_01H7Y9C3D2", "1", "Bash", "MED", "44ms", "cyan"],
  ].map(([time, event, session, turn, tool, risk, duration, tone]) => ({
    time,
    event,
    session,
    turn,
    tool,
    risk,
    duration,
    tone,
  })) as TuiDashboardProps["events"],
  inspector: {
    title: "EVENT INSPECTOR",
    id: "evt_01H8Z4J7E8_0000C1F6",
    value: {
      hook_event_name: "PostCompact",
      session_id: "sess_01H8Z4J7E8",
      turn_id: 12,
      tool_name: "-",
      tool_input: {},
      cwd: "/Users/dev/projects/example",
      transcript_path: ".automation/transcripts/sess_01H8Z4J7E8.jsonl",
      decision: "approved",
      risk: "low",
      duration_ms: 70,
      timestamp: "2026-05-24T13:35:12.625Z",
    },
    riskMix: {
      total: "422",
      subLabel: "Risk",
      segments: [
        { label: "Low", value: 312, color: theme.green },
        { label: "Medium", value: 86, color: theme.amber },
        { label: "High", value: 24, color: theme.red },
      ],
      legend: ["■ Low       312  74%", "■ Medium     86  20%", "■ High       24   6%"],
    },
  },
  files: [
    {
      time: "13:35:12",
      kind: "MODIFIED",
      path: "app/middleware/auth.ts",
      delta: "+63 -12",
      fileType: "TypeScript",
      summary: "Refactored auth middleware",
    },
    {
      time: "13:35:11",
      kind: "CREATED",
      path: "reports/session-risk.ndjson",
      delta: "+1 (840 B)",
      fileType: "NDJSON",
      summary: "Captured high-friction approval trace",
    },
    {
      time: "13:35:08",
      kind: "MODIFIED",
      path: "app/server.ts",
      delta: "+842 -128",
      fileType: "TypeScript",
      summary: "Edited request handler and error response format",
    },
    {
      time: "13:35:07",
      kind: "MODIFIED",
      path: ".automation/config.toml",
      delta: "+4 -1",
      fileType: "TOML",
      summary: "Updated hooks configuration",
    },
    {
      time: "13:35:05",
      kind: "MODIFIED",
      path: "ui/eventStore.ts",
      delta: "+112 -37",
      fileType: "TypeScript",
      summary: "Added batching for event ingestion",
    },
  ],
  footer: {
    status: [
      { label: "Status", value: "● Connected", tone: "green" },
      { label: "Events", value: "1,251 (↑ 18%)", tone: "white" },
      { label: "Errors", value: "0", tone: "lime" },
      { label: "Warnings", value: "2", tone: "amber" },
    ],
    controls: ["[q] Quit", "[p] Pause", "[f] Filter:All", "[/] Search:Off", "[tab] Focus:Event Stream", "[j/k] Event:0"],
  },
};

function rotateValues(values: number[], offset: number): number[] {
  if (values.length === 0) return values;
  const normalized = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)];
}

function rotateRows<T>(rows: T[], offset: number): T[] {
  if (rows.length === 0) return rows;
  const normalized = ((offset % rows.length) + rows.length) % rows.length;
  return [...rows.slice(normalized), ...rows.slice(0, normalized)];
}

function shiftedTime(base: string, tick: number): string {
  const [hours = "00", minutes = "00", seconds = "00"] = base.split(":");
  const [wholeSeconds = "00", millis = "000"] = seconds.split(".");
  const date = new Date(Date.UTC(2026, 4, 24, Number(hours), Number(minutes), Number(wholeSeconds), Number(millis)));
  date.setUTCSeconds(date.getUTCSeconds() + tick);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")}.${String(date.getUTCMilliseconds()).padStart(3, "0")}`;
}

export function buildMock2Dashboard(tick = 0, paused = false): TuiDemoDashboardData {
  const eventOffset = Math.floor(tick / 2);
  const events = rotateRows(mock2Dashboard.events, eventOffset).map((event, index) => ({
    ...event,
    time: shiftedTime(event.time, tick + index),
    duration: event.duration === "-" ? "-" : `${Math.max(18, Number.parseInt(event.duration, 10) + ((tick + index) % 9) - 4)}ms`,
  }));
  const files = rotateRows(mock2Dashboard.files, Math.floor(tick / 3)).map((file, index) => ({
    ...file,
    time: shiftedTime(`${file.time}.000`, tick + index).slice(0, 8),
  }));
  const eventCount = 1251 + tick * 3;
  const warnings = 2 + (tick % 3 === 0 ? 1 : 0);

  return {
    ...mock2Dashboard,
    metrics: mock2Dashboard.metrics.map((metric, index) => ({
      ...metric,
      value:
        metric.title === "TOOL CALLS TODAY"
          ? String(156 + tick * 2)
          : metric.title === "FILE MODIFICATIONS"
            ? String(38 + (tick % 7))
            : metric.title === "ACTIVE HOOKS"
              ? String(14 + (tick % 3))
              : metric.value,
      sparkValues: metric.sparkValues ? rotateValues(metric.sparkValues, tick + index) : metric.sparkValues,
    })),
    events,
    files,
    inspector: {
      ...mock2Dashboard.inspector,
      id: `evt_01H8Z4J7E8_${String(tick).padStart(8, "0")}`,
      value: {
        ...(mock2Dashboard.inspector.value as Record<string, unknown>),
        hook_event_name: events[0]?.event ?? "PostCompact",
        session_id: events[0]?.session ?? "sess_01H8Z4J7E8",
        tool_name: events[0]?.tool ?? "-",
        duration_ms: events[0]?.duration === "-" ? null : Number.parseInt(events[0]?.duration ?? "0", 10),
        timestamp: `2026-05-24T${events[0]?.time ?? "13:35:12.625"}Z`,
      },
    },
    footer: {
      status: [
        { label: "Status", value: paused ? "● Paused" : "● Connected", tone: paused ? "amber" : "green" },
        { label: "Events", value: `${eventCount.toLocaleString("en-US")} (↑ 18%)`, tone: "white" },
        { label: "Errors", value: "0", tone: "lime" },
        { label: "Warnings", value: String(warnings), tone: "amber" },
      ],
      controls: [
        "[q] Quit",
        `[p] ${paused ? "Resume" : "Pause"}`,
        "[f] Filter:All",
        "[/] Search:Off",
        "[tab] Focus:Event Stream",
        `[j/k] Event:${tick % Math.max(1, events.length)}`,
      ],
    },
  };
}
