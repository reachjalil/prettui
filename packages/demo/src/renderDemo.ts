import {
  box,
  bars,
  dashSpark,
  dim,
  dotSparkline,
  fitAnsi,
  hstack,
  lowBars,
  normalizeFrame,
  rgb,
  selectedLine,
  segmentedDonut,
  theme,
  type Tone,
} from "@prettui/core";
import {
  renderDonutSummaryPanel,
  renderEventStreamPanel,
  renderFileWatcherPanel,
  renderBrandHeader,
  renderFooter,
  renderHeatmapPanel,
  renderJsonInspectorPanel,
  renderKeyValuePanel,
  renderLogPanel,
  renderNavigationPanel,
  renderPanel,
  renderSparkSectionsPanel,
  renderStatusStrip,
  renderSummaryCards,
  renderTablePanel,
  renderTimelinePanel,
  type EventStreamRow,
  type SummaryMetric,
  type TimelinePanelRow,
} from "@prettui/components";
import type { TuiDashboardPanelId, TuiDashboardProps } from "@prettui/dashboard";
import {
  renderEventExplorerLayout,
  renderPermissionWorkflowLayout,
  renderSessionAnalyticsLayout,
  renderStreamOperationsLayout,
} from "@prettui/layouts";
import { buildMock2Dashboard } from "./data";
import {
  buildKitchenSinkNavigationRows,
  kitchenSinkDefaultExpandedSectionMask,
  kitchenSinkComponents,
  kitchenSinkEvents,
  kitchenSinkNavigationSections,
  kitchenSinkSegments,
  kitchenSinkSpark,
  kitchenSinkTimelineRows,
  type KitchenSinkComponentDemo,
  type KitchenSinkDataMode,
  type KitchenSinkDensity,
} from "./kitchenSinkData";

export const demoChoices = ["mock1", "mock2", "mock3", "mock4", "kitchen-sink"] as const;
export const demoPanels = ["navigation", "eventStream", "inspector", "fileWatcher"] as const satisfies readonly TuiDashboardPanelId[];
export const demoRiskFilters = ["All", "Low", "Medium", "High"] as const;
export const kitchenSinkFocusZones = ["navigation", "preview", "options"] as const;

export type TuiDemoChoice = (typeof demoChoices)[number];
export type TuiDemoPanel = (typeof demoPanels)[number];
export type TuiDemoRiskFilter = (typeof demoRiskFilters)[number];
export type KitchenSinkFocusZone = (typeof kitchenSinkFocusZones)[number];

export type TuiDemoInteractionState = {
  activePanel?: TuiDemoPanel;
  eventFilter?: TuiDemoRiskFilter;
  searchMode?: boolean;
  searchQuery?: string;
  selectedEventIndex?: number;
  navigationIndex?: number;
  kitchenSinkFocus?: KitchenSinkFocusZone;
  kitchenSinkComponentIndex?: number;
  kitchenSinkOptionGroupIndex?: number;
  kitchenSinkDataIndex?: number;
  kitchenSinkVariantIndex?: number;
  kitchenSinkDensityIndex?: number;
  kitchenSinkPreviewIndex?: number;
  kitchenSinkExpandedSectionMask?: number;
  kitchenSinkNavRowIndex?: number;
};

export type TuiDemoRenderOptions = Pick<TuiDashboardProps, "width" | "height" | "color"> & {
  tick?: number;
  paused?: boolean;
  choice?: TuiDemoChoice | "menu";
  menuIndex?: number;
  interaction?: TuiDemoInteractionState;
};

const spark = [4, 6, 5, 8, 6, 9, 7, 5, 8, 3, 4, 2, 5, 3, 7, 4, 6, 2];
const choiceLabels: Record<TuiDemoChoice, { title: string; detail: string }> = {
  mock1: { title: "mock1", detail: "Session analytics control room" },
  mock2: { title: "mock2", detail: "Event explorer with navigation and inspector" },
  mock3: { title: "mock3", detail: "Stream operations command center" },
  mock4: { title: "mock4", detail: "Permission workflow console" },
  "kitchen-sink": { title: "kitchen-sink", detail: "Component previews with selectable states" },
};
const focusLabels: Record<TuiDemoPanel, string> = {
  navigation: "Navigation",
  eventStream: "Event Stream",
  inspector: "Event Inspector",
  fileWatcher: "File Watcher",
};
const riskFilterCodes: Record<TuiDemoRiskFilter, EventStreamRow["risk"] | "ALL"> = {
  All: "ALL",
  Low: "LOW",
  Medium: "MED",
  High: "HIGH",
};
const riskTone: Record<TuiDemoRiskFilter, Tone | "all"> = {
  All: "all",
  Low: "green",
  Medium: "amber",
  High: "red",
};

function shiftedTime(base: string, tick: number): string {
  const [hours = "00", minutes = "00", seconds = "00"] = base.split(":");
  const [wholeSeconds = "00", millis = "000"] = seconds.split(".");
  const date = new Date(Date.UTC(2026, 4, 24, Number(hours), Number(minutes), Number(wholeSeconds), Number(millis)));
  date.setUTCSeconds(date.getUTCSeconds() + tick);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")}.${String(date.getUTCMilliseconds()).padStart(3, "0")}`;
}

function rotateRows<T>(rows: T[], offset: number): T[] {
  if (!rows.length) return rows;
  const normalized = ((offset % rows.length) + rows.length) % rows.length;
  return [...rows.slice(normalized), ...rows.slice(0, normalized)];
}

function clampIndex(value: number | undefined, maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  return Math.max(0, Math.min(maxExclusive - 1, Math.floor(value ?? 0)));
}

function textMatches(values: string[], query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return values.some((value) => value.toLowerCase().includes(normalizedQuery));
}

function timelineMatches(row: TimelinePanelRow, filter: TuiDemoRiskFilter, query: string): boolean {
  const tone = riskTone[filter];
  return (tone === "all" || row.tone === tone) && textMatches([row.time, row.label, row.detail, row.meta ?? ""], query);
}

function eventMatches(row: EventStreamRow, filter: TuiDemoRiskFilter, query: string): boolean {
  const riskCode = riskFilterCodes[filter];
  const matchesRisk = riskCode === "ALL" || row.risk === riskCode;
  return matchesRisk && textMatches([row.time, row.event, row.session, row.turn, row.tool, row.risk, row.duration], query);
}

function controlFooter(paused: boolean, interaction: TuiDemoInteractionState, count: number, activePanel?: TuiDemoPanel): string[] {
  const searchLabel = interaction.searchMode ? interaction.searchQuery || "_" : interaction.searchQuery || "Off";
  const selected = count ? clampIndex(interaction.selectedEventIndex, count) + 1 : 0;
  return [
    "[q] Quit",
    "[esc] Menu",
    `[p] ${paused ? "Resume" : "Pause"}`,
    `[f] Filter:${interaction.eventFilter ?? "All"}`,
    `[/] Search:${searchLabel}`,
    activePanel ? `[tab] Focus:${focusLabels[activePanel]}` : "[tab] Focus",
    `[j/k] Event:${selected}/${count}`,
  ];
}

function renderDemoMenu(options: TuiDemoRenderOptions): string {
  const width = Math.max(56, Math.floor(options.width));
  const height = Math.max(18, Math.floor(options.height));
  const color = options.color ?? true;
  const selected = clampIndex(options.menuIndex, demoChoices.length);
  const header = renderBrandHeader({
    title: "prettui",
    subtitle: "terminal automation realtime analytics TUI demos",
    status: [rgb("● LIVE", theme.green, color), dim("Select 1-5 or Enter", color)],
    width,
    color,
  });
  const inner = Math.min(width, 94);
  const rows = [
    rgb("Choose a TUI demo", theme.green, color),
    "",
    ...demoChoices.map((choice, index) => {
      const item = `${index + 1}. ${choiceLabels[choice].title.padEnd(6)} ${choiceLabels[choice].detail}`;
      return index === selected ? selectedLine(item, inner - 4, color) : fitAnsi(item, inner - 4);
    }),
    "",
    dim("Enter opens the selected demo. Esc returns here from any demo.", color),
  ];
  const menu = box("", rows, {
    width: inner,
    height: Math.min(14, Math.max(10, height - header.split("\n").length - 2)),
    color,
    paddingX: 1,
    accent: theme.cyan,
  });
  const leftPad = " ".repeat(Math.max(0, Math.floor((width - inner) / 2)));
  const centered = menu
    .split("\n")
    .map((line) => `${leftPad}${line}`)
    .join("\n");
  return normalizeFrame([header, "", centered].join("\n"), width, height);
}

function buildEventExplorer(options: Omit<TuiDemoRenderOptions, "width" | "height" | "color">) {
  const tick = options.tick ?? 0;
  const paused = options.paused ?? false;
  const interaction = options.interaction ?? {};
  const activePanel = interaction.activePanel ?? "eventStream";
  const eventFilter = interaction.eventFilter ?? "All";
  const searchQuery = interaction.searchQuery ?? "";
  const base = buildMock2Dashboard(tick, paused);
  const events = base.events.filter((row) => eventMatches(row, eventFilter, searchQuery));
  const selectedEventIndex = clampIndex(interaction.selectedEventIndex, events.length);
  const selectedEvent = events[selectedEventIndex];
  const navigationIndex = clampIndex(interaction.navigationIndex, base.navigation.items.length);
  const filterLabel = searchQuery ? `${eventFilter} / ${searchQuery}` : eventFilter;

  return {
    ...base,
    navigation: {
      ...base.navigation,
      items: base.navigation.items.map((item, index) => ({ ...item, active: index === navigationIndex })),
      filters: base.navigation.filters?.map((filter) => (filter.label === "Risk" ? { ...filter, value: eventFilter } : filter)),
      searchHint: interaction.searchMode
        ? `Search: ${searchQuery || "_"}`
        : searchQuery
          ? `Filtering: ${searchQuery}`
          : base.navigation.searchHint,
    },
    events,
    inspector: {
      ...base.inspector,
      id: selectedEvent ? `evt_01H8Z4J7E8_${String(tick + selectedEventIndex).padStart(8, "0")}` : "evt_none",
      value: selectedEvent
        ? {
            hook_event_name: selectedEvent.event,
            session_id: selectedEvent.session,
            turn_id: Number(selectedEvent.turn),
            tool_name: selectedEvent.tool,
            tool_input: selectedEvent.tool === "-" ? {} : { path: "ui/eventStore.ts", offset: 0, limit: 220 },
            cwd: "/Users/dev/projects/example",
            transcript_path: `.automation/transcripts/${selectedEvent.session}.jsonl`,
            decision: selectedEvent.risk === "HIGH" ? "blocked" : "approved",
            risk: selectedEvent.risk.toLowerCase(),
            duration_ms: selectedEvent.duration === "-" ? null : Number.parseInt(selectedEvent.duration, 10),
            timestamp: `2026-05-24T${selectedEvent.time}Z`,
          }
        : { state: "empty", reason: "No events match the current filter", query: searchQuery },
    },
    footer: { ...base.footer, controls: controlFooter(paused, interaction, events.length, activePanel) },
    state: { activePanel, eventFilter: filterLabel, selectedEventIndex },
  };
}

function demoTimeline(tick: number): TimelinePanelRow[] {
  return rotateRows(
    [
      ["13:35:30.000", "SessionStart", "Session initiated", "green", 0.08],
      ["13:35:27.000", "UserPromptSubmit", "Optimize stream batching", "amber", 0.22],
      ["13:35:25.000", "PreToolUse", "Tool: Edit", "cyan", 0.36],
      ["13:35:24.000", "PermissionRequest", "Edit src/stream/runner.ts", "amber", 0.48],
      ["13:35:23.000", "PostToolUse", "Tool: Edit success", "green", 0.62],
      ["13:35:12.000", "PreToolUse", "Bash rm -rf dist/*", "cyan", 0.74],
      ["13:35:11.000", "PermissionRequest", "High risk command block", "red", 0.82],
      ["13:35:10.000", "Stop", "Session completed", "red", 0.94],
    ].map(([time, label, detail, tone, position]) => ({
      time: shiftedTime(String(time), tick),
      label: String(label),
      detail: String(detail),
      tone: tone as Tone,
      position: Number(position),
    })),
    Math.floor(tick / 3)
  );
}

function permissionEvents(tick: number): TimelinePanelRow[] {
  return [
    { time: "12:45:31", label: "Prompt submitted", detail: "Refactor auth flow to use better error handling", tone: "green" },
    { time: "12:45:32", label: "Permission request", detail: "Write file src/auth/session.ts", tone: "amber" },
    { time: "12:45:33", label: "Tool started", detail: "Read filesystem.read", tone: "cyan" },
    { time: "12:45:36", label: "Tool result", detail: "Edit OK in 42ms", tone: "green" },
    { time: "12:45:37", label: "Tool started", detail: "Run shell.exec npm test", tone: "cyan" },
    { time: "12:45:49", label: "Tool result", detail: "PASS tests/auth/session.test.ts", tone: "green" },
    { time: "12:45:53", label: "Stop summary", detail: "Completed by user", tone: "red" },
  ].map((row) => ({ ...row, time: shiftedTime(`${row.time}.000`, tick).slice(0, 8), tone: row.tone as Tone }));
}

function filteredRows(rows: TimelinePanelRow[], options: Omit<TuiDemoRenderOptions, "width" | "height" | "color">): TimelinePanelRow[] {
  const interaction = options.interaction ?? {};
  return rows.filter((row) => timelineMatches(row, interaction.eventFilter ?? "All", interaction.searchQuery ?? ""));
}

function renderChoice1(options: TuiDemoRenderOptions): string {
  const tick = options.tick ?? 0;
  const rows = filteredRows(demoTimeline(tick), options);
  const controls = options.interaction ?? {};
  const paused = options.paused ?? false;
  return renderSessionAnalyticsLayout({
    width: options.width,
    height: options.height,
    color: options.color,
    brand: {
      title: "prettui",
      subtitle: "terminal automation Hook Realtime Analytics",
      version: "v0.1.0",
      uptime: `00:13:${String(8 + tick).padStart(2, "0")}`,
      eventCount: 1902 + tick * 4,
    },
    summary: [
      { label: "Session ID", value: "sess_8f3a9c2e" },
      { label: "Events", value: String(1902 + tick * 4), tone: "green", sparkValues: spark },
      { label: "Hooks Fired", value: String(674 + tick), tone: "green", sparkValues: spark.slice().reverse() },
      { label: "Errors", value: String(tick % 3), tone: "red", sparkValues: spark.slice(3) },
    ],
    model: [
      { label: "Model", value: "automation-1", tone: "amber" },
      { label: "Context", value: "196,608" },
      { label: "Temperature", value: "0.2" },
      { label: "Reasoning", value: "medium" },
    ],
    repository: [
      { label: "Repository", value: "example/insights-pipeline" },
      { label: "Branch", value: "main", tone: "green" },
      { label: "CWD", value: "/home/dev/insights-pipeline" },
      { label: "Git", value: "+12 -3 -1", tone: "green" },
    ],
    permission: ["Smart (Default)", "", "Auto Approve   Read, Grep, LS", "Confirm        Write, Edit", "Deny           Network, Dangerous"],
    hooks: ["6 / 6", "● SessionStart", "● UserPromptSubmit", "● PreToolUse", "● PermissionRequest", "● PostToolUse", "● Stop"],
    timeline: rows,
    prompt: [
      rgb("> Add a realtime analytics stream for terminal automation hooks", theme.green, options.color ?? true),
      "Include session, prompt, tool, permission, and stop events.",
      "...",
      "Focus on low overhead and rich context.",
    ],
    lifecycle: {
      total: "92",
      segments: [
        { label: "Read", value: 34, color: theme.green },
        { label: "Write", value: 21, color: theme.amber },
        { label: "Bash", value: 18, color: theme.red },
        { label: "Other", value: 19, color: theme.white },
      ],
    },
    approvals: [
      "a7c1  Write  src/services/ingest.ts  MED",
      "d9e2  Bash   docker compose up -d   HIGH",
      "",
      "Approve: a   Deny: d   Open: e",
    ],
    files: rows
      .slice(0, 5)
      .map((row, index) => ({ ...row, label: index % 2 ? "M" : "A", detail: `src/hooks/${index}.ts  +${12 + index * 7} -${index}` })),
    updated: [
      { label: "src/hooks.ts", value: "5", tone: "green", sparkValues: spark },
      { label: "analytics_stream.ts", value: "3", tone: "green", sparkValues: spark.slice(2) },
      { label: ".automation/hooks.json", value: "2", tone: "amber", sparkValues: spark.slice(4) },
    ],
    risks: rows.filter((row) => row.tone === "red" || row.tone === "amber"),
    logs: rows.map((row) => ({ ...row, label: row.tone === "red" ? "ERROR" : row.tone === "amber" ? "WARN" : "INFO" })),
    footer: {
      status: [{ label: "Status", value: paused ? "Paused" : "Live", tone: paused ? "amber" : "green" }],
      controls: controlFooter(paused, controls, rows.length),
    },
    selectedIndex: clampIndex(controls.selectedEventIndex, rows.length),
  });
}

function renderChoice2(options: TuiDemoRenderOptions): string {
  return renderEventExplorerLayout({ ...buildEventExplorer(options), width: options.width, height: options.height, color: options.color });
}

function renderChoice3(options: TuiDemoRenderOptions): string {
  const tick = options.tick ?? 0;
  const rows = filteredRows(demoTimeline(tick), options);
  const controls = options.interaction ?? {};
  const paused = options.paused ?? false;
  return renderStreamOperationsLayout({
    width: options.width,
    height: options.height,
    color: options.color,
    brand: {
      title: "prettui",
      subtitle: "terminal automation realtime analytics",
      workspace: "~/projects/aurora-ops",
      branch: "feature/stream-optimizer",
    },
    status: [
      { title: "Stream Health", status: "LIVE", tone: "green", lines: [{ label: "Rate", value: `${124 + tick} ev/s`, tone: "green" }] },
      {
        title: "Agent",
        lines: [
          { value: "automation-1", tone: "cyan" },
          { label: "Version", value: "v5.2.1" },
        ],
      },
      { title: "Hooks", lines: [{ value: `${(12.3 + tick / 100).toFixed(1)}K` }, { label: "Delta", value: "↑ 6.9%", tone: "green" }] },
      { title: "Tokens", lines: [{ value: "2.28M" }, { label: "Delta", value: "↑ 12.8%", tone: "green" }] },
    ],
    waterfall: rows,
    matrix: rows.map((row, index) => ({
      ...row,
      label: index % 3 === 0 ? "Edit" : index % 3 === 1 ? "Bash" : "Read",
      detail: `${row.label}  ${index % 2 ? "RUNNING" : "OK"}  ${row.detail}`,
    })),
    approvalCards: [
      "BLOCKED (RISKY)     15:41:55",
      "Bash   rm -rf dist/*",
      "Reason: Destructive command",
      "",
      "PENDING APPROVAL      --",
      "No pending requests",
      "",
      "LAST APPROVED         15:42:12",
      "Edit src/stream/runner.ts",
    ],
    approvalStats: {
      total: "502",
      segments: [
        { label: "Approved", value: 312, color: theme.green },
        { label: "Blocked", value: 27, color: theme.red },
        { label: "Auto", value: 145, color: theme.blue },
        { label: "Review", value: 18, color: theme.amber },
      ],
    },
    heatmap: ["src/", "tests/", "docs/", "scripts/", "config/", "README.md"].map((label, index) => ({
      label,
      values: spark.map((value) => ((value + index + tick) % 10) / 10),
    })),
    files: rows.slice(0, 7).map((_row, index) => ({
      label: `src/stream/${index}.ts`,
      value: `${index + 1}  +${38 + index}/-${index + 3}`,
      tone: index % 2 ? "amber" : "green",
    })),
    services: ["Event Stream", "Hook Processing", "Tool Runner", "Context Manager", "Disk I/O", "Memory"].map((label, index) => ({
      label,
      value: index % 2 ? "LIVE" : `${124 + tick} ev/s`,
      tone: "green",
      sparkValues: spark.slice(index),
    })),
    resources: [
      { label: "CPU", value: "16%", detail: "resource", tone: "green", values: spark },
      { label: "RAM", value: "1.42 GB", detail: "8 GB", tone: "cyan", values: spark.slice(2) },
      { label: "DISK", value: "42 GB", detail: "256 GB", tone: "amber", values: spark.slice(4) },
    ],
    footer: {
      status: [{ label: "Active Session", value: "3c9f2a7b", tone: "cyan" }],
      controls: controlFooter(paused, controls, rows.length),
    },
    selectedIndex: clampIndex(controls.selectedEventIndex, rows.length),
  });
}

function renderChoice4(options: TuiDemoRenderOptions): string {
  const tick = options.tick ?? 0;
  const rows = filteredRows(permissionEvents(tick), options);
  const controls = options.interaction ?? {};
  const paused = options.paused ?? false;
  return renderPermissionWorkflowLayout({
    width: options.width,
    height: options.height,
    color: options.color,
    brand: { title: "prettui", subtitle: "automation realtime analytics TUI" },
    header: [
      {
        title: "Session",
        status: "LIVE",
        tone: "green",
        lines: [{ value: "sess_0132X7K9M3FZQ8V6" }, { label: "User", value: "dev@example.dev" }],
      },
      { title: "Model", lines: [{ value: "automation-1" }, { label: "Reasoning", value: "high" }] },
      {
        title: "Hooks Loaded",
        status: "13/13",
        tone: "green",
        lines: [
          { label: "PreTool", value: "6" },
          { label: "PostTool", value: "5" },
        ],
      },
      { title: "Connection", status: "CONNECTED", tone: "green", lines: [{ label: "Latency", value: `${31 + tick}ms`, tone: "green" }] },
    ],
    events: rows,
    tools: rows.slice(1, 6).map((row, index) => ({
      ...row,
      label: ["filesystem.read", "filesystem.edit", "shell.exec", "filesystem.write", "shell.exec"][index] ?? row.label,
      detail: `${index + 1}. Success ${index % 2 ? "42ms" : "18ms"}`,
    })),
    fileActivity: {
      total: "12",
      segments: [
        { label: "Created", value: 4, color: theme.green },
        { label: "Modified", value: 7, color: theme.amber },
        { label: "Deleted", value: 1, color: theme.red },
      ],
      files: [],
    },
    approvals: [
      "12:45:32 filesystem.write  Approved  Medium",
      "12:45:34 filesystem.edit   Approved  Medium",
      "12:45:47 shell.exec        Approved  Low",
      "",
      "Policy: default (on)",
      "✓ No network access",
      "✓ No destructive commands",
      "✓ Writes confined to workspace",
    ],
    eventDetail: [
      "● Tool result      shell.exec",
      "Time       12:45:49",
      "Status     Success (exit 0)",
      "Duration   12.1s",
      "",
      "> npm test -- --runInBand",
      "PASS tests/auth/session.test.ts",
      "Tests: 128 passed",
    ],
    risks: [
      { label: "Low Risk", value: "118 (83%)", detail: "Read operations, tests", tone: "green", values: spark },
      { label: "Medium Risk", value: "21 (15%)", detail: "File writes, edits", tone: "amber", values: spark.slice(2) },
      { label: "High Risk", value: "3 (2%)", detail: "Delete, eval, network", tone: "red", values: spark.slice(4) },
    ],
    footer: { status: [{ label: "prettui", value: "v0.1.0", tone: "white" }], controls: controlFooter(paused, controls, rows.length) },
    selectedIndex: clampIndex(controls.selectedEventIndex, rows.length),
  });
}

type KitchenSinkResolvedOptions = {
  dataIndex: number;
  variantIndex: number;
  densityIndex: number;
  dataMode: KitchenSinkDataMode;
  variantId: string;
  density: KitchenSinkDensity;
};

function kitchenSinkSelectedComponent(options: TuiDemoRenderOptions): {
  component: KitchenSinkComponentDemo;
  index: number;
  optionGroupIndex: number;
  resolved: KitchenSinkResolvedOptions;
  previewIndex: number;
  focus: KitchenSinkFocusZone;
} {
  const index = clampIndex(
    options.interaction?.kitchenSinkComponentIndex ?? options.interaction?.selectedEventIndex,
    kitchenSinkComponents.length
  );
  const component = kitchenSinkComponents[index] ?? kitchenSinkComponents[0];
  const optionGroupIndex = clampIndex(options.interaction?.kitchenSinkOptionGroupIndex, component.optionGroups.length);
  const dataGroup = component.optionGroups.find((group) => group.id === "data") ?? component.optionGroups[0];
  const variantGroup = component.optionGroups.find((group) => group.id === "variant") ?? component.optionGroups[1] ?? dataGroup;
  const densityGroup = component.optionGroups.find((group) => group.id === "density") ?? component.optionGroups[2] ?? dataGroup;
  const dataIndex = clampIndex(options.interaction?.kitchenSinkDataIndex, dataGroup?.choices.length ?? 1);
  const variantIndex = clampIndex(options.interaction?.kitchenSinkVariantIndex, variantGroup?.choices.length ?? 1);
  const densityIndex = clampIndex(options.interaction?.kitchenSinkDensityIndex ?? 1, densityGroup?.choices.length ?? 1);
  return {
    component,
    index,
    optionGroupIndex,
    resolved: {
      dataIndex,
      variantIndex,
      densityIndex,
      dataMode: (dataGroup?.choices[dataIndex]?.id ?? "static") as KitchenSinkDataMode,
      variantId: variantGroup?.choices[variantIndex]?.id ?? "default",
      density: (densityGroup?.choices[densityIndex]?.id ?? "comfortable") as KitchenSinkDensity,
    },
    previewIndex: Math.max(0, Math.floor(options.interaction?.kitchenSinkPreviewIndex ?? 0)),
    focus: options.interaction?.kitchenSinkFocus ?? "navigation",
  };
}

function kitchenSinkSelectedChoiceIndex(groupId: string, resolved: KitchenSinkResolvedOptions): number {
  if (groupId === "variant") return resolved.variantIndex;
  if (groupId === "density") return resolved.densityIndex;
  return resolved.dataIndex;
}

function renderKitchenSinkChoiceLine(
  group: KitchenSinkComponentDemo["optionGroups"][number],
  selectedIndex: number,
  width: number,
  color: boolean
): string {
  const chipWidth = Math.max(6, Math.min(10, Math.floor((width - 4) / Math.max(1, group.choices.length))));
  const choices = group.choices.map((choice, index) => {
    const label = fitAnsi(choice.label, chipWidth);
    return index === selectedIndex ? rgb(`[${label.trim()}]`, theme.white, color) : dim(label, color);
  });
  return fitAnsi(choices.join(" "), width);
}

function renderKitchenSinkOptions(
  component: KitchenSinkComponentDemo,
  selectedGroupIndex: number,
  resolved: KitchenSinkResolvedOptions,
  width: number,
  height: number,
  color: boolean,
  active: boolean
): string {
  const inner = Math.max(1, width - 4);
  const rows = [
    rgb("OPTIONS", theme.green, color),
    dim("Tab focus. j/k field. f/space/enter/h/l changes value.", color),
    "",
    ...component.optionGroups.flatMap((group, groupIndex) => {
      const selectedIndex = kitchenSinkSelectedChoiceIndex(group.id, resolved);
      const selected = group.choices[selectedIndex] ?? group.choices[0];
      const marker = active && groupIndex === selectedGroupIndex ? "› " : "  ";
      const choiceLine = `${marker}${renderKitchenSinkChoiceLine(group, selectedIndex, Math.max(1, inner - 2), color)}`;
      return [
        rgb(group.label.toUpperCase(), theme.cyan, color),
        active && groupIndex === selectedGroupIndex ? selectedLine(choiceLine, inner, color) : fitAnsi(choiceLine, inner),
        dim(`  ${selected?.description ?? "Preview selectable state"}`, color),
        "",
      ];
    }),
    rgb("COMPONENT", theme.green, color),
    component.description,
    "",
    dim("[tab] Focus  [j/k] Field  [f/space] Toggle", color),
  ];
  return renderPanel({
    title: "Controls",
    children: rows,
    width,
    height,
    color,
    paddingX: 1,
    accent: active ? theme.cyan : theme.border,
    titleAlign: "left",
  });
}

function kitchenSinkNav(
  index: number,
  navRowIndex: number,
  expandedMask: number,
  width: number,
  height: number,
  color: boolean,
  active: boolean
): string {
  const icons: Record<string, string> = {
    "brand-header": "◆",
    "summary-cards": "▦",
    "navigation-panel": "☰",
    "event-stream": "≋",
    "json-inspector": "{}",
    "file-watcher": "◫",
    footer: "▔",
    "generic-panel": "□",
    "table-panel": "▤",
    "layout-dashboard-grid": "▦",
    "layout-master-detail": "▥",
    "layout-triple-pane": "▧",
    "layout-command-center": "⌂",
    "layout-responsive-stack": "▱",
    "layout-comparison-board": "⇄",
    "layout-scroll-contract": "↕",
    "layout-modal-workflow": "▣",
    "sparkline-chart": "⌁",
    "bar-chart": "▥",
    "area-chart": "◒",
    "gauge-chart": "▣",
    "histogram-chart": "┆",
    "scatter-plot": "◉",
    "distribution-bars": "▧",
    "matrix-grid": "≡",
    "pie-donut-chart": "◍",
    "donut-summary-widget": "◌",
    "heatmap-widget": "▧",
    "timeline-widget": "┆",
    "spark-sections-widget": "▨",
    "status-strip-widget": "▣",
    "key-value-widget": "◇",
    "log-widget": "≡",
    "text-widget": "¶",
    "practice-focus-map": "◎",
    "practice-keyboard-model": "⌨",
    "practice-state-patterns": "◇",
    "practice-density-scale": "≣",
    "practice-color-tones": "◐",
    "practice-overflow-guard": "…",
    "practice-data-loading": "↻",
    "practice-error-boundary": "!",
  };
  const inner = Math.max(1, width - 4);
  const rows = buildKitchenSinkNavigationRows(expandedMask);
  const rowLimit = Math.max(0, height - 12);
  const start = rowLimit > 0 ? clampIndex(navRowIndex - Math.floor(rowLimit / 2), Math.max(1, rows.length - rowLimit + 1)) : 0;
  const visibleRows = rows.slice(start, start + rowLimit);
  const lines = [rgb("NAVIGATION", theme.green, color)];

  visibleRows.forEach((row, rowIndex) => {
    const absoluteRowIndex = start + rowIndex;
    const rowFocused = active && absoluteRowIndex === navRowIndex;
    if (row.kind === "section") {
      const marker = row.expanded ? "▾" : "▸";
      const count = row.section.componentIds.length;
      const line = `${marker} ${row.section.label} ${dim(`(${count})`, color)}`;
      lines.push(rowFocused ? selectedLine(line, inner, color) : rgb(fitAnsi(line, inner), theme.cyan, color));
      return;
    }

    const icon = icons[row.component.id] ?? "·";
    const line = `  ${icon}  ${row.component.label}${row.componentIndex === index ? " ›" : ""}`;
    lines.push(rowFocused || row.componentIndex === index ? selectedLine(line, inner, color) : fitAnsi(line, inner));
  });

  lines.push(dim("─".repeat(inner), color));
  lines.push(rgb("GROUPS", theme.green, color));
  lines.push(
    `Open ${String(kitchenSinkNavigationSections.filter((_section, sectionIndex) => (expandedMask & (1 << sectionIndex)) !== 0).length).padStart(2)} / ${kitchenSinkNavigationSections.length}`
  );
  lines.push(`Items ${String(kitchenSinkComponents.length).padStart(2)}`);
  lines.push(dim("─".repeat(inner), color));
  lines.push(rgb("ACTIONS", theme.green, color));
  lines.push(dim(active ? "j/k row  f/space toggle section" : "Tab to focus navigation", color));

  return renderPanel({ children: lines, width, height, color, paddingX: 1, accent: active ? theme.cyan : undefined });
}

function rotateValues(values: number[], offset: number): number[] {
  return rotateRows(values, offset);
}

function scaleValue(value: number, min: number, max: number, buckets: string[]): string {
  const span = max - min || 1;
  const index = Math.max(0, Math.min(buckets.length - 1, Math.round(((value - min) / span) * (buckets.length - 1))));
  return buckets[index] ?? buckets[0] ?? "";
}

function renderAreaRows(values: number[], width: number, height: number, color: boolean, accent = theme.green): string[] {
  const sample = values.length >= width ? values.slice(values.length - width) : [...values];
  while (sample.length < width) sample.unshift(sample[0] ?? 0);
  const min = Math.min(...sample);
  const max = Math.max(...sample);
  return Array.from({ length: height }, (_unused, row) => {
    const threshold = max - ((row + 1) / height) * (max - min || 1);
    return rgb(sample.map((value) => (value >= threshold ? "█" : " ")).join(""), accent, color);
  });
}

function renderGauge(label: string, value: number, width: number, color: boolean): string {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const fillWidth = Math.max(1, Math.round((clamped / 100) * width));
  const tone = clamped >= 85 ? theme.red : clamped >= 65 ? theme.amber : theme.green;
  return `${fitAnsi(label, 12)} ${rgb("█".repeat(fillWidth), tone, color)}${dim("░".repeat(Math.max(0, width - fillWidth)), color)} ${String(clamped).padStart(3)}%`;
}

function renderHistogramRows(labels: string[], values: number[], width: number, color: boolean): string[] {
  const max = Math.max(1, ...values);
  return labels.map((label, index) => {
    const value = values[index] ?? 0;
    const barWidth = Math.max(1, Math.round((value / max) * width));
    const tone = index > labels.length * 0.66 ? theme.red : index > labels.length * 0.4 ? theme.amber : theme.green;
    return `${fitAnsi(label, 9)} ${rgb("█".repeat(barWidth), tone, color)} ${String(value).padStart(3)}`;
  });
}

function renderScatterRows(
  points: Array<{ x: number; y: number; selected?: boolean }>,
  width: number,
  height: number,
  color: boolean
): string[] {
  const grid = Array.from({ length: height }, () => Array.from({ length: width }, () => "·"));
  for (const point of points) {
    const x = Math.max(0, Math.min(width - 1, Math.round(point.x * (width - 1))));
    const y = Math.max(0, Math.min(height - 1, height - 1 - Math.round(point.y * (height - 1))));
    grid[y][x] = point.selected ? "◆" : "•";
  }
  return grid.map((row) =>
    row
      .map((cell) => (cell === "◆" ? rgb(cell, theme.amber, color) : cell === "•" ? rgb(cell, theme.green, color) : dim(cell, color)))
      .join("")
  );
}

function renderDistributionRows(rows: Array<{ label: string; value: number; tone: Tone }>, width: number, color: boolean): string[] {
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  return rows.map((row) => {
    const percent = row.value / total;
    const barWidth = Math.max(1, Math.round(percent * width));
    return `${fitAnsi(row.label, 12)} ${rgb("█".repeat(barWidth), theme[row.tone], color)}${dim("░".repeat(Math.max(0, width - barWidth)), color)} ${String(Math.round(percent * 100)).padStart(3)}%`;
  });
}

function renderMatrixRows(rowLabels: string[], columnLabels: string[], values: number[][], color: boolean): string[] {
  const header = `${fitAnsi("", 10)} ${columnLabels.map((label) => fitAnsi(label, 5)).join(" ")}`;
  const cell = (value: number) => {
    if (value >= 8) return rgb("██", theme.red, color);
    if (value >= 5) return rgb("▓▓", theme.amber, color);
    if (value >= 2) return rgb("▒▒", theme.green, color);
    return dim("░░", color);
  };
  return [
    header,
    ...rowLabels.map(
      (label, rowIndex) =>
        `${fitAnsi(label, 10)} ${columnLabels.map((_column, columnIndex) => fitAnsi(cell(values[rowIndex]?.[columnIndex] ?? 0), 5)).join(" ")}`
    ),
  ];
}

function renderGuideSurface(title: string, rows: string[], width: number, height: number, color: boolean, accent = theme.border): string {
  return renderPanel({ title, children: rows, width, height, color, paddingX: 1, accent, titleAlign: "left" });
}

function guideDataLabel(resolved: KitchenSinkResolvedOptions, tick: number): string {
  if (resolved.dataMode === "empty") return "Data: Empty sample";
  if (resolved.dataMode === "dynamic") return `Data: Dynamic tick ${tick}`;
  return "Data: Static snapshot";
}

function guideRows(title: string, items: string[], color: boolean): string[] {
  return [rgb(title.toUpperCase(), theme.green, color), ...items.map((item) => `- ${item}`)];
}

function renderRuleRows(
  rows: Array<{ label: string; value: string; detail: string; tone?: Tone }>,
  width: number,
  color: boolean
): string[] {
  return rows.map((row) => {
    const tone = row.tone ?? "white";
    return `${rgb(fitAnsi(row.label, 14), theme[tone], color)} ${fitAnsi(row.value, 16)} ${dim(fitAnsi(row.detail, Math.max(8, width - 33)), color)}`;
  });
}

function guideMiniPanel(title: string, rows: string[], width: number, height: number, color: boolean, accent = theme.border): string {
  return renderPanel({
    title,
    children: rows,
    width: Math.max(12, width),
    height: Math.max(5, height),
    color,
    paddingX: 1,
    accent,
    titleAlign: "left",
  });
}

function renderResponsiveDiagram(variant: string, density: KitchenSinkDensity, width: number, color: boolean): string[] {
  const desktop = "[ Navigation ][       Preview Surface       ][ Options ]";
  const tablet = "[ Navigation ][ Preview Surface ]\n[        Options / Inspector        ]";
  const narrow = "[ Navigation ]\n[ Preview Surface ]\n[ Options ]";
  const active = variant === "tablet" ? tablet : variant === "narrow" ? narrow : desktop;
  const densityNote =
    density === "compact"
      ? "Small: keep only labels and primary values."
      : density === "expanded"
        ? "Large: add explanations, secondary values, and legends."
        : "Medium: default labels, values, and hints.";
  return [
    rgb("RESPONSIVE RULE", theme.green, color),
    ...active.split("\n").map((line) => fitAnsi(line, width)),
    "",
    densityNote,
    dim("Breakpoint order: preserve focus, then reflow panes, then hide metadata.", color),
  ];
}

function renderKitchenSinkLayoutGuide(
  component: KitchenSinkComponentDemo,
  options: {
    resolved: KitchenSinkResolvedOptions;
    previewIndex: number;
    tick: number;
    width: number;
    height: number;
    color: boolean;
    active: boolean;
  }
): string {
  const { resolved, previewIndex, tick, width, height, color, active } = options;
  const inner = Math.max(24, width - 4);
  const dataTick = resolved.dataMode === "dynamic" ? tick : 0;
  const empty = resolved.dataMode === "empty";
  const dense = resolved.density === "compact";
  const expanded = resolved.density === "expanded";
  const title = `${component.label} Guide`;
  const accent = active ? theme.cyan : theme.border;
  const smallPaneHeight = dense ? 6 : expanded ? 10 : 8;
  const variant = resolved.variantId;
  const stateLine = guideDataLabel(resolved, dataTick);

  if (component.id === "layout-dashboard-grid") {
    const panelHeight = Math.max(6, Math.floor((height - 10) / 2));
    const leftWidth = Math.max(20, Math.floor((inner - 1) * (variant === "wide" ? 0.36 : 0.5)));
    const rightWidth = Math.max(20, inner - leftWidth - 1);
    const metrics = empty
      ? ["No metrics", "Primary empty action"]
      : [`Sessions ${3 + dataTick}`, `Approvals ${2 + (dataTick % 4)}`, "Risk 1 med"];
    const trend = empty
      ? ["No series", dashSpark(Math.max(12, rightWidth - 6), theme.slate, color)]
      : [
          variant === "wide" ? "Hero trend" : "Trend",
          bars(rotateValues(kitchenSinkSpark, dataTick), Math.max(12, rightWidth - 6), theme.green, color),
        ];
    const stream = empty
      ? ["No stream rows", "Keep panel height stable"]
      : eventsPreviewRows(dataTick, previewIndex).slice(0, dense ? 2 : 4);
    const detail =
      variant === "dense"
        ? ["Density: compact", "More panes, fewer labels", "Use fixed row budgets"]
        : ["Selected event detail", `Variant: ${variant}`, "Actions live in footer"];
    const top = hstack(
      [
        guideMiniPanel("Metrics", metrics, leftWidth, panelHeight, color, theme.green),
        guideMiniPanel("Trend", trend, rightWidth, panelHeight, color, theme.cyan),
      ],
      1
    );
    const bottom = hstack(
      [
        guideMiniPanel("Stream", stream, leftWidth, panelHeight, color, theme.amber),
        guideMiniPanel("Detail", detail, rightWidth, panelHeight, color, theme.border),
      ],
      1
    );
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...top.split("\n"),
        ...bottom.split("\n"),
        "",
        ...guideRows(
          "Rules",
          ["One root frame owns total height.", "Cards and charts share row rhythm.", "Footer carries commands, not card chrome."],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "layout-master-detail") {
    const masterWidth = Math.max(22, Math.floor(inner * 0.3));
    const detailWidth =
      variant === "compare" ? Math.max(22, Math.floor((inner - masterWidth - 2) / 2)) : Math.max(28, Math.floor(inner * 0.44));
    const inspectorWidth = Math.max(18, inner - masterWidth - detailWidth - 2);
    const masterRows = empty
      ? ["No records", "Search or clear filter"]
      : eventsPreviewRows(dataTick, previewIndex).slice(0, expanded ? 6 : 4);
    const detailRows = empty
      ? ["Select a record", "Detail keeps its dimensions"]
      : ["Event detail", "tool: Edit", `latency: ${42 + dataTick}ms`, `risk: ${variant === "inspector" ? "MED" : "LOW"}`];
    const inspectorRows =
      variant === "compare"
        ? ["Previous record", "tool: Read", "latency: 37ms", "risk: LOW"]
        : ["Inspector", "Owner: preview", "Actions: footer", "Errors: inline"];
    const panes =
      variant === "list-detail"
        ? [
            guideMiniPanel("Master", masterRows, masterWidth, smallPaneHeight + 4, color, theme.green),
            guideMiniPanel("Detail", detailRows, inner - masterWidth - 1, smallPaneHeight + 4, color, theme.cyan),
          ]
        : [
            guideMiniPanel("Master", masterRows, masterWidth, smallPaneHeight + 4, color, theme.green),
            guideMiniPanel(variant === "compare" ? "Selected" : "Detail", detailRows, detailWidth, smallPaneHeight + 4, color, theme.cyan),
            guideMiniPanel(
              variant === "compare" ? "Previous" : "Inspector",
              inspectorRows,
              inspectorWidth,
              smallPaneHeight + 4,
              color,
              theme.amber
            ),
          ];
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...hstack(panes, 1).split("\n"),
        "",
        ...guideRows(
          "Focus contract",
          ["j/k moves the master list.", "Enter opens detail actions.", "Tab moves to detail or inspector without losing selection."],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "layout-triple-pane") {
    const navWidth = variant === "collapsed" ? 14 : Math.max(18, Math.floor(inner * 0.22));
    const inspectorWidth = variant === "collapsed" ? 10 : Math.max(20, Math.floor(inner * 0.24));
    const mainWidth = Math.max(24, inner - navWidth - inspectorWidth - 2);
    const panes = hstack(
      [
        guideMiniPanel("Nav", ["Components", "Filters", "Search"], navWidth, smallPaneHeight + 6, color, theme.green),
        guideMiniPanel(
          "Main",
          empty
            ? ["Empty work surface", "Show action and reason"]
            : ["Interactive preview", "Owns scroll", `Sample ${12 + dataTick}`, "No nested cards"],
          mainWidth,
          smallPaneHeight + 6,
          color,
          theme.cyan
        ),
        guideMiniPanel(
          variant === "collapsed" ? "Rail" : "Inspector",
          variant === "resizable"
            ? ["min 24 cols", "max 36 cols", "drag or key resize"]
            : variant === "collapsed"
              ? ["i", "?", "!"]
              : ["Options", "Metadata", "Actions"],
          inspectorWidth,
          smallPaneHeight + 6,
          color,
          theme.amber
        ),
      ],
      1
    );
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...panes.split("\n"),
        "",
        ...guideRows(
          "Pane rules",
          [
            "Each pane has a fixed min width.",
            "Only one pane owns vertical scroll per column.",
            "Collapsed rails keep icon labels discoverable.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "layout-command-center") {
    const status = renderStatusStrip({
      width: inner,
      height: dense ? 7 : 9,
      color,
      active,
      cells: empty
        ? [{ title: "Stream", status: "idle", tone: "slate", lines: [{ label: "rate", value: "0/s" }] }]
        : [
            {
              title: variant === "incident" ? "Incident" : "Stream",
              status: variant === "incident" ? "OPEN" : "LIVE",
              tone: variant === "incident" ? "red" : "green",
              lines: [{ label: "rate", value: `${124 + dataTick}/s` }],
            },
            {
              title: "Queue",
              status: variant === "approvals" ? "review" : "watch",
              tone: "amber",
              lines: [{ label: "depth", value: String(3 + (dataTick % 7)) }],
            },
            { title: "Agent", status: "ready", tone: "cyan", lines: [{ label: "hooks", value: "13/13" }] },
          ],
    });
    const left = guideMiniPanel(
      variant === "incident" ? "Timeline" : "Live Stream",
      empty ? ["No events"] : eventsPreviewRows(dataTick, previewIndex).slice(0, expanded ? 6 : 4),
      Math.max(28, Math.floor(inner * 0.6)),
      smallPaneHeight + 3,
      color,
      theme.green
    );
    const right = guideMiniPanel(
      variant === "approvals" ? "Approvals" : "Action Queue",
      empty ? ["No pending work"] : ["Review write", "Approve safe edit", "Escalate shell", `SLA ${8 + dataTick}m`],
      Math.max(20, inner - Math.max(28, Math.floor(inner * 0.6)) - 1),
      smallPaneHeight + 3,
      color,
      theme.amber
    );
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...status.split("\n"),
        ...hstack([left, right], 1).split("\n"),
        "",
        ...guideRows(
          "Ops pattern",
          [
            "Status first, work queue second, history third.",
            "Dangerous actions stay visually separated.",
            "Footer owns the command vocabulary.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "layout-responsive-stack") {
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...renderResponsiveDiagram(variant, resolved.density, inner, color),
        "",
        ...guideRows(
          "Best practice",
          [
            "Design the narrow stack first for focus order.",
            "Use stable dimensions instead of viewport-scaled text.",
            "Hide metadata before hiding primary actions.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "layout-comparison-board") {
    const paneWidth = Math.max(18, Math.floor((inner - 2) / 3));
    const labels =
      variant === "models"
        ? ["Model A", "Model B", "Delta"]
        : variant === "files"
          ? ["Before", "After", "Diff"]
          : ["Baseline", "Candidate", "Delta"];
    const leftRows = empty ? ["No baseline"] : [`score ${82 + dataTick}`, "latency 42ms", "cost $0.18"];
    const midRows = empty ? ["No candidate"] : [`score ${86 + dataTick}`, "latency 39ms", "cost $0.21"];
    const diffRows = empty ? ["No diff"] : ["+4 score", "-3ms latency", "+$0.03 cost"];
    const board = hstack(
      [
        guideMiniPanel(labels[0] ?? "A", leftRows, paneWidth, smallPaneHeight + 4, color, theme.green),
        guideMiniPanel(labels[1] ?? "B", midRows, paneWidth, smallPaneHeight + 4, color, theme.cyan),
        guideMiniPanel(labels[2] ?? "Delta", diffRows, inner - paneWidth * 2 - 2, smallPaneHeight + 4, color, theme.amber),
      ],
      1
    );
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...board.split("\n"),
        "",
        ...guideRows(
          "Comparison rules",
          [
            "Align rows so deltas can be scanned vertically.",
            "Use semantic color only for meaningful differences.",
            "Keep raw values visible next to summarized deltas.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "layout-scroll-contract") {
    const rows =
      variant === "sticky"
        ? [
            { label: "Header", value: "fixed", detail: "brand and current context", tone: "cyan" as const },
            { label: "Footer", value: "fixed", detail: "commands and status never scroll", tone: "cyan" as const },
            { label: "Body panes", value: "scroll", detail: "only content panes move", tone: "green" as const },
          ]
        : variant === "overflow"
          ? [
              { label: "Labels", value: "truncate", detail: "fitAnsi before render", tone: "amber" as const },
              { label: "Tables", value: "clip", detail: "fixed columns with priority drop", tone: "amber" as const },
              { label: "Panels", value: "bounded", detail: "no child changes parent size", tone: "green" as const },
            ]
          : [
              { label: "Root fixed", value: "no scroll", detail: "frame equals terminal dimensions", tone: "cyan" as const },
              { label: "Nav scroll", value: "row owner", detail: "left pane owns component list", tone: "green" as const },
              { label: "Preview scroll", value: "content", detail: "main pane owns large output", tone: "green" as const },
              { label: "Options fixed", value: "field list", detail: "right pane keeps controls visible", tone: "amber" as const },
            ];
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        rgb("SCROLL OWNERS", theme.green, color),
        ...renderRuleRows(rows, inner, color),
        "",
        ...guideRows(
          "Failure modes",
          ["No hidden document scroll.", "No nested scroll unless each owner is named.", "No dynamic content can resize the root frame."],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "layout-modal-workflow") {
    const shell = guideMiniPanel(
      "Background Shell",
      ["Nav stays visible", "Preview dimmed", "Footer shows modal keys"],
      Math.max(28, Math.floor(inner * 0.46)),
      smallPaneHeight + 5,
      color,
      theme.slate
    );
    const modalRows =
      variant === "confirm"
        ? ["Confirm destructive action", "", "[Cancel]  [Approve]", "Esc closes, Enter confirms"]
        : variant === "wizard"
          ? ["Step 2 of 4", "Choose data source", "[Back] [Next]", "State preserved on close"]
          : ["Command Palette", "> filter events", "Open component", "Run snapshot"];
    const modal = guideMiniPanel(
      variant === "confirm" ? "Confirm" : variant === "wizard" ? "Wizard" : "Command",
      empty ? ["No commands available", "Show why and next action"] : modalRows,
      Math.max(26, inner - Math.max(28, Math.floor(inner * 0.46)) - 1),
      smallPaneHeight + 5,
      color,
      variant === "confirm" ? theme.amber : theme.cyan
    );
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...hstack([shell, modal], 1).split("\n"),
        "",
        ...guideRows(
          "Overlay rules",
          [
            "Capture focus, then restore the previous zone.",
            "Always show cancel and commit keys.",
            "Never erase the underlying work context.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  return renderGuideSurface(title, [stateLine, "", "Layout guide not configured."], width, height, color, accent);
}

function eventsPreviewRows(dataTick: number, selectedIndex: number): string[] {
  return rotateRows(kitchenSinkEvents as EventStreamRow[], dataTick).map((event, index) => {
    const marker = index === selectedIndex % kitchenSinkEvents.length ? ">" : " ";
    return `${marker} ${event.time.slice(0, 8)} ${fitAnsi(event.event, 18)} ${event.risk}`;
  });
}

function renderKitchenSinkPracticeGuide(
  component: KitchenSinkComponentDemo,
  options: {
    resolved: KitchenSinkResolvedOptions;
    previewIndex: number;
    tick: number;
    width: number;
    height: number;
    color: boolean;
    active: boolean;
  }
): string {
  const { resolved, previewIndex, tick, width, height, color, active } = options;
  const inner = Math.max(24, width - 4);
  const dataTick = resolved.dataMode === "dynamic" ? tick : 0;
  const empty = resolved.dataMode === "empty";
  const dense = resolved.density === "compact";
  const expanded = resolved.density === "expanded";
  const accent = active ? theme.cyan : theme.border;
  const title = `${component.label} Guide`;
  const variant = resolved.variantId;
  const stateLine = guideDataLabel(resolved, dataTick);

  if (component.id === "practice-focus-map") {
    const flows =
      variant === "modal"
        ? ["Previous focus: Options", "Open modal: Command Palette", "Tab cycles inside modal", "Close: restore Options"]
        : variant === "roving"
          ? ["List owns one active index", "j/k updates active row", "Enter commits current row", "Selection survives re-render"]
          : [
              "Navigation -> Preview -> Options",
              "Shift+Tab reverses order",
              "Preview can own interactive rows",
              "Footer reports active zone",
            ];
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        rgb("FOCUS FLOW", theme.green, color),
        ...flows.map((line, index) => (index === previewIndex % flows.length ? selectedLine(line, inner, color) : fitAnsi(line, inner))),
        "",
        ...guideRows(
          "Rules",
          [
            "Use named zones instead of ad hoc booleans.",
            "Keep roving index separate from selected data.",
            "Restore focus after modal or route changes.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "practice-keyboard-model") {
    const rows =
      variant === "editing"
        ? [
            { label: "h/l", value: "change value", detail: "enum fields move left or right", tone: "green" as const },
            { label: "enter", value: "commit", detail: "same as selecting current value", tone: "green" as const },
            { label: "esc", value: "cancel", detail: "leave edit/search/modal mode", tone: "amber" as const },
          ]
        : variant === "global"
          ? [
              { label: "q", value: "quit", detail: "highest priority after ctrl-c", tone: "red" as const },
              { label: "esc", value: "menu/back", detail: "returns to launcher or closes overlay", tone: "amber" as const },
              { label: "r", value: "sample", detail: "manual dynamic tick for tests", tone: "cyan" as const },
            ]
          : [
              { label: "tab", value: "focus next", detail: "cycles named zones", tone: "cyan" as const },
              { label: "j/k", value: "move", detail: "moves inside focused collection", tone: "green" as const },
              { label: "f/space", value: "toggle", detail: "section or option value", tone: "amber" as const },
            ];
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        rgb("KEY CONTRACT", theme.green, color),
        ...renderRuleRows(rows, inner, color),
        "",
        ...guideRows(
          "Rules",
          [
            "Global keys are resolved before focused controls.",
            "Focused controls can override space and enter.",
            "The footer must match the actual key map.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "practice-state-patterns") {
    const state = empty ? "empty" : variant;
    const rows =
      state === "loading"
        ? ["Loading events...", "", "████████░░ 80%", "Keep rows stable while data arrives."]
        : state === "error"
          ? ["Could not load events", "", "Reason: network timeout", "[Retry]  [Open logs]"]
          : ["No events found", "", "Clear filters or connect a session.", "[Clear filters]"];
    const panel = guideMiniPanel(
      state === "error" ? "Error State" : state === "loading" ? "Loading State" : "Empty State",
      rows,
      Math.max(28, Math.min(inner, 64)),
      expanded ? 12 : 9,
      color,
      state === "error" ? theme.red : state === "loading" ? theme.amber : theme.cyan
    );
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...panel.split("\n"),
        "",
        ...guideRows(
          "State rules",
          [
            "Every panel has empty, loading, partial, and error states.",
            "Fallbacks preserve pane dimensions.",
            "Messages explain cause and next action.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "practice-density-scale") {
    const rows = [
      {
        label: "Small",
        value: dense ? "active" : "available",
        detail: "labels + values, minimal prose",
        tone: dense ? ("green" as const) : ("white" as const),
      },
      {
        label: "Medium",
        value: resolved.density === "comfortable" ? "active" : "available",
        detail: "default review density",
        tone: resolved.density === "comfortable" ? ("green" as const) : ("white" as const),
      },
      {
        label: "Large",
        value: expanded ? "active" : "available",
        detail: "legends, help text, comparison rows",
        tone: expanded ? ("green" as const) : ("white" as const),
      },
    ];
    const details =
      variant === "information"
        ? ["Small hides secondary metadata.", "Medium shows primary context.", "Large adds legends and explanations."]
        : variant === "touchpoints"
          ? ["Commands need predictable hit rows.", "Selected rows must not resize.", "Dense mode keeps focus markers visible."]
          : ["Use one row rhythm per pane.", "Do not scale text with terminal width.", "Padding changes only at named densities."];
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        rgb("DENSITY SCALE", theme.green, color),
        ...renderRuleRows(rows, inner, color),
        "",
        ...guideRows("Guidance", details, color),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "practice-color-tones") {
    const toneRows: Array<{ label: string; value: string; detail: string; tone: Tone }> =
      variant === "risk"
        ? [
            { label: "Green", value: "low", detail: "safe or successful", tone: "green" },
            { label: "Amber", value: "medium", detail: "needs review", tone: "amber" },
            { label: "Red", value: "high", detail: "blocked or dangerous", tone: "red" },
          ]
        : variant === "status"
          ? [
              { label: "Green", value: "live", detail: "healthy stream", tone: "green" },
              { label: "Cyan", value: "active", detail: "selected or informational", tone: "cyan" },
              { label: "Slate", value: "idle", detail: "disabled or secondary", tone: "slate" },
            ]
          : [
              { label: "Green", value: "success", detail: "complete and safe", tone: "green" },
              { label: "Amber", value: "warning", detail: "review required", tone: "amber" },
              { label: "Red", value: "danger", detail: "error or destructive", tone: "red" },
              { label: "Cyan", value: "focus", detail: "active pane or selection", tone: "cyan" },
            ];
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        rgb("SEMANTIC TONES", theme.green, color),
        ...toneRows.map(
          (row) =>
            `${rgb("██", theme[row.tone], color)} ${rgb(fitAnsi(row.label, 8), theme[row.tone], color)} ${fitAnsi(row.value, 12)} ${dim(row.detail, color)}`
        ),
        "",
        ...guideRows(
          "Rules",
          [
            "Color communicates state, not decoration.",
            "Selection uses one consistent accent.",
            "Disabled text stays readable but secondary.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "practice-overflow-guard") {
    const longLabel = "very-long-component-name-with-rich-context-and-status";
    const rows =
      variant === "wrap"
        ? [
            "Wrap prose only in known content zones.",
            fitAnsi("This long explanation is clipped by the renderer instead of pushing the frame wider.", inner),
            "Prefer line budgets over uncontrolled wrapping.",
          ]
        : variant === "priority"
          ? [
              "Priority drop order",
              "1. decorative metadata",
              "2. secondary values",
              "3. descriptions",
              "4. primary label/value never disappear",
            ]
          : [`Raw: ${longLabel}`, `Fit: ${fitAnsi(longLabel, Math.max(12, inner - 8))}`, "Columns keep fixed widths before render."];
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        rgb("OVERFLOW CONTRACT", theme.green, color),
        ...rows,
        "",
        ...guideRows(
          "Rules",
          [
            "Apply fitAnsi at every pane boundary.",
            "Tables own fixed columns and align numeric data.",
            "Dynamic content cannot resize buttons, rows, or panes.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "practice-data-loading") {
    const rows =
      variant === "stale"
        ? [
            { label: "Stream", value: "stale", detail: `${12 + dataTick}s since update`, tone: "amber" as const },
            { label: "Rows", value: "cached", detail: "last known data remains visible", tone: "cyan" as const },
          ]
        : variant === "optimistic"
          ? [
              { label: "Action", value: "pending", detail: "local update shown immediately", tone: "amber" as const },
              { label: "Server", value: "confirming", detail: "commit or rollback when result arrives", tone: "cyan" as const },
            ]
          : [
              {
                label: "Stream",
                value: empty ? "empty" : "live",
                detail: empty ? "no source connected" : `${124 + dataTick}/s`,
                tone: empty ? ("slate" as const) : ("green" as const),
              },
              { label: "Latency", value: empty ? "-" : `${31 + dataTick}ms`, detail: "show age near live data", tone: "cyan" as const },
            ];
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        rgb("DATA STATES", theme.green, color),
        ...renderRuleRows(rows, inner, color),
        "",
        ...guideRows(
          "Rules",
          ["Live data has freshness context.", "Stale data is useful if labeled clearly.", "Optimistic rows must be reversible."],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  if (component.id === "practice-error-boundary") {
    const scope = variant === "section" ? "Section" : variant === "app" ? "App" : "Panel";
    const failing = guideMiniPanel(
      `${scope} Failure`,
      ["Renderer failed", "Keep shell mounted", "[Retry] [Report]"],
      Math.max(24, Math.floor(inner * 0.42)),
      dense ? 7 : 9,
      color,
      theme.red
    );
    const healthy = guideMiniPanel(
      "Neighbor Pane",
      empty ? ["No companion data"] : ["Still interactive", "State preserved", `Tick ${dataTick}`],
      Math.max(24, inner - Math.max(24, Math.floor(inner * 0.42)) - 1),
      dense ? 7 : 9,
      color,
      theme.green
    );
    return renderGuideSurface(
      title,
      [
        stateLine,
        "",
        ...hstack([failing, healthy], 1).split("\n"),
        "",
        ...guideRows(
          "Rules",
          [
            "Catch failures at the smallest useful boundary.",
            "Fallbacks preserve adjacent panes and footer commands.",
            "Recovery paths should be keyboard reachable.",
          ],
          color
        ),
      ],
      width,
      height,
      color,
      accent
    );
  }

  return renderGuideSurface(title, [stateLine, "", "Practice guide not configured."], width, height, color, accent);
}

function renderKitchenSinkPreview(
  component: KitchenSinkComponentDemo,
  options: {
    resolved: KitchenSinkResolvedOptions;
    previewIndex: number;
    tick: number;
    width: number;
    height: number;
    color: boolean;
    active: boolean;
  }
): string {
  const { resolved, previewIndex, tick, width, height, color, active } = options;
  const dataTick = resolved.dataMode === "dynamic" ? tick : 0;
  const dense = resolved.density === "compact";
  const expanded = resolved.density === "expanded";
  const emptyVariant = resolved.dataMode === "empty";
  const variant = resolved.variantId;
  const previewHeight = Math.max(8, height);
  const events = rotateRows(kitchenSinkEvents as EventStreamRow[], dataTick).map((event, index) => ({
    ...event,
    time: shiftedTime(event.time, dataTick + index),
    duration: event.duration === "-" ? "-" : `${Math.max(12, Number.parseInt(event.duration, 10) + ((dataTick + index) % 11) - 5)}ms`,
  }));
  const dynamicSpark = rotateValues(kitchenSinkSpark, dataTick);
  const dynamicSegments = kitchenSinkSegments.map((segment, index) => ({
    ...segment,
    value: segment.value + ((dataTick + index * 7) % 23),
  }));
  const dynamicTimeline = rotateRows(kitchenSinkTimelineRows, dataTick).map((row, index) => ({
    ...row,
    time: shiftedTime(`${row.time}.000`, dataTick + index).slice(0, 8),
  }));
  const titleRight = dim(`${component.label} preview`, color);

  if (component.category === "layout") {
    return renderKitchenSinkLayoutGuide(component, options);
  }

  if (component.category === "practice") {
    return renderKitchenSinkPracticeGuide(component, options);
  }

  if (component.id === "brand-header") {
    return renderPanel({
      title: titleRight,
      children: renderBrandHeader({
        title: variant === "library" ? "prettui" : variant === "minimal" ? "TUI" : "prettui",
        subtitle: emptyVariant
          ? "No active session"
          : variant === "minimal"
            ? "Terminal UI"
            : `Composable terminal UI components · tick ${dataTick}`,
        status: [rgb(emptyVariant ? "● PAUSED" : "● LIVE", emptyVariant ? theme.amber : theme.green, color), dim("Kitchen sink", color)],
        width: Math.max(20, width - 4),
        color,
      }),
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "summary-cards") {
    const metrics: SummaryMetric[] =
      variant === "risk"
        ? [
            {
              title: "HIGH RISK",
              value: emptyVariant ? "0" : String(2 + (dataTick % 4)),
              delta: emptyVariant ? "↓ clear" : "↑ review",
              tone: emptyVariant ? "green" : "red",
              sparkValues: dynamicSpark,
            },
            {
              title: "MEDIUM",
              value: emptyVariant ? "0" : String(8 + (dataTick % 3)),
              delta: "↓ 1 pending",
              tone: "amber",
              spark: "bars" as const,
              sparkValues: dynamicSpark.slice().reverse(),
            },
            {
              title: "LOW",
              value: emptyVariant ? "0" : String(42 + dataTick),
              delta: "↑ accepted",
              tone: "green",
              spark: "lowBars" as const,
              sparkValues: dynamicSpark,
            },
          ]
        : variant === "capacity"
          ? [
              {
                title: "EVENT RATE",
                value: emptyVariant ? "0/s" : `${124 + dataTick}/s`,
                delta: "↑ live",
                tone: "cyan",
                spark: "bars" as const,
                sparkValues: dynamicSpark,
              },
              {
                title: "QUEUE",
                value: emptyVariant ? "0" : String(2 + (dataTick % 6)),
                delta: "↓ draining",
                tone: "amber",
                sparkValues: dynamicSpark.slice().reverse(),
              },
              {
                title: "CPU",
                value: emptyVariant ? "0%" : `${16 + (dataTick % 20)}%`,
                delta: "stable",
                tone: "green",
                spark: "lowBars" as const,
                sparkValues: dynamicSpark,
              },
            ]
          : [
              {
                title: "SESSIONS",
                value: emptyVariant ? "0" : String(3 + (dataTick % 4)),
                delta: emptyVariant ? "empty" : "↑ 2 today",
                tone: "green",
                sparkValues: dynamicSpark,
              },
              {
                title: "APPROVALS",
                value: emptyVariant ? "0" : String(2 + (dataTick % 3)),
                delta: "↓ 1 pending",
                tone: "amber",
                spark: dense ? ("dash" as const) : ("bars" as const),
                sparkValues: dynamicSpark.slice().reverse(),
              },
              {
                title: "RISK",
                value: emptyVariant ? "0" : String(1 + (dataTick % 5)),
                delta: emptyVariant ? "clean" : "↑ review",
                tone: emptyVariant ? "green" : "red",
                spark: "lowBars" as const,
                sparkValues: dynamicSpark,
              },
            ];
    return renderPanel({
      title: titleRight,
      children: emptyVariant
        ? renderPanel({
            children: ["No summary metrics", "", "Connect a session or switch Data to Static/Dynamic."],
            width: Math.max(24, width - 4),
            height: 8,
            color,
            paddingX: 1,
          })
        : renderSummaryCards(metrics, Math.max(24, width - 4), color),
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      titleAlign: "left",
    });
  }

  if (component.id === "navigation-panel") {
    const showFilters = variant !== "minimal" && !emptyVariant;
    return renderNavigationPanel({
      width,
      height: previewHeight,
      color,
      active,
      items: (emptyVariant ? ["Overview", "Hooks", "Tools"] : ["Overview", "Hooks", "Tools", "Files", "Risk", "Approvals"]).map(
        (label, itemIndex) => ({
          icon: ["⌂", "⌘", "⚒", "▣", "◇", "✓"][itemIndex] ?? "·",
          label,
          active: itemIndex === previewIndex % Math.max(1, emptyVariant ? 3 : 6),
        })
      ),
      filters: showFilters
        ? [
            { label: "Risk", value: variant === "filters" ? "High" : "All" },
            { label: "Since", value: expanded ? "24h ago" : "30m ago" },
          ]
        : undefined,
      searchHint: emptyVariant ? "No navigation data" : variant === "filters" ? "Filtering: permission" : "Press / to filter events...",
    });
  }

  if (component.id === "event-stream") {
    const filteredEvents = emptyVariant
      ? []
      : variant === "high-risk"
        ? events.filter((event) => event.risk !== "LOW")
        : variant === "low-risk"
          ? events.filter((event) => event.risk === "LOW")
          : events;
    return renderEventStreamPanel({
      width,
      height: previewHeight,
      color,
      active,
      rows: filteredEvents,
      filter: emptyVariant ? "Empty" : variant === "high-risk" ? "High + Medium" : variant === "low-risk" ? "Low" : "All",
      selectedIndex: previewIndex,
    });
  }

  if (component.id === "json-inspector") {
    const inspectorValue = emptyVariant
      ? { state: "empty", reason: "No event selected" }
      : variant === "compact-json"
        ? { event: events[previewIndex % events.length]?.event ?? "PostToolUse", risk: "low", tick: dataTick }
        : {
            hook_event_name: events[previewIndex % events.length]?.event ?? "PermissionRequest",
            session_id: events[previewIndex % events.length]?.session ?? "sess_01H8Z4J7E8",
            tool_name: events[previewIndex % events.length]?.tool ?? "Bash",
            risk: variant === "risk-mix" ? "medium" : "low",
            cwd: "/Users/dev/projects/example",
          };
    return renderJsonInspectorPanel({
      title: "EVENT INSPECTOR",
      id: emptyVariant ? "evt_empty" : `evt_01H8Z4J7E8_${String(dataTick).padStart(4, "0")}`,
      value: inspectorValue,
      riskMix:
        !emptyVariant && variant === "risk-mix" && !dense
          ? {
              total: "422",
              subLabel: "Risk",
              segments: kitchenSinkSegments,
              legend: ["■ Low       312  74%", "■ Medium     86  20%", "■ High       24   6%"],
            }
          : undefined,
      width,
      height: previewHeight,
      color,
      active,
    });
  }

  if (component.id === "file-watcher") {
    const fileRows = emptyVariant
      ? []
      : variant === "generated"
        ? [
            {
              time: shiftedTime("13:35:12.000", dataTick).slice(0, 8),
              kind: "CREATED",
              path: "reports/session-risk.ndjson",
              delta: "+1",
              fileType: "NDJSON",
              summary: "Captured approval trace",
            },
            {
              time: shiftedTime("13:35:11.000", dataTick).slice(0, 8),
              kind: "MODIFIED",
              path: "dist/index.js",
              delta: `+${8 + dataTick} -2`,
              fileType: "Build",
              summary: "Generated output refreshed",
            },
          ]
        : variant === "deletions"
          ? [
              {
                time: shiftedTime("13:35:10.000", dataTick).slice(0, 8),
                kind: "DELETED",
                path: "tmp/old-report.json",
                delta: "-1",
                fileType: "JSON",
                summary: "Removed stale fixture",
              },
              {
                time: shiftedTime("13:35:08.000", dataTick).slice(0, 8),
                kind: "MODIFIED",
                path: "src/renderDemo.ts",
                delta: `+${12 + dataTick} -8`,
                fileType: "TypeScript",
                summary: "Updated cleanup branch",
              },
            ]
          : [
              {
                time: shiftedTime("13:35:12.000", dataTick).slice(0, 8),
                kind: "MODIFIED",
                path: "src/renderDemo.ts",
                delta: `+${120 + dataTick} -8`,
                fileType: "TypeScript",
                summary: "Added kitchen sink renderer",
              },
              {
                time: shiftedTime("13:35:11.000", dataTick).slice(0, 8),
                kind: "CREATED",
                path: "src/kitchenSinkData.ts",
                delta: "+1",
                fileType: "TypeScript",
                summary: "Component fixtures and options",
              },
              {
                time: shiftedTime("13:35:08.000", dataTick).slice(0, 8),
                kind: "MODIFIED",
                path: "apps/tui-demo/README.md",
                delta: "+6 -2",
                fileType: "Markdown",
                summary: "Updated controls documentation",
              },
            ];
    return renderFileWatcherPanel({
      width,
      height: previewHeight,
      color,
      active,
      watching: dense ? undefined : "apps/tui-demo/src",
      rows: fileRows,
    });
  }

  if (component.id === "footer") {
    return renderPanel({
      title: titleRight,
      children: renderFooter({
        width: Math.max(24, width - 4),
        color,
        status: [
          {
            label: "Status",
            value: emptyVariant ? "● Empty" : variant === "warning" ? "● Warning" : "● Connected",
            tone: emptyVariant || variant === "warning" ? "amber" : "green",
          },
          {
            label: variant === "status" ? "Events" : "Component",
            value: variant === "status" ? String(1251 + dataTick) : component.label,
            tone: "cyan",
          },
        ],
        controls:
          variant === "status"
            ? ["Status: Connected", "Errors: 0", "Warnings: 2"]
            : ["[q] Quit", "[esc] Menu", "[j/k] Component", "[f] Option"],
      }),
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      titleAlign: "left",
    });
  }

  if (component.id === "generic-panel" || component.id === "text-widget") {
    const lines = emptyVariant
      ? ["No content", "", "Switch Data to Static or Dynamic to populate this panel."]
      : variant === "checklist"
        ? ["Review checklist", "", "✓ Data enum selected", "✓ Variant enum selected", "✓ Density enum selected", `✓ Tick ${dataTick}`]
        : variant === "warning" || variant === "notice"
          ? ["Notice", "", "Configuration changed.", "Review empty, static, and dynamic data paths."]
          : [
              variant === "approval" ? "Approval note" : "Reusable boxed surface",
              "",
              `• Dynamic tick ${dataTick}`,
              "• Accent",
              "• Padding",
              "• Fixed height",
            ];
    return renderPanel({
      title: variant === "checklist" ? "Checklist Panel" : "Generic Panel",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: dense ? 0 : 1,
      accent: active ? theme.cyan : variant === "warning" || variant === "notice" ? theme.amber : theme.border,
      titleAlign: dense ? "left" : "center",
    });
  }

  if (component.id === "table-panel") {
    const rows = emptyVariant
      ? []
      : variant === "tools"
        ? events.map((event) => ({ ...event, event: event.tool === "-" ? event.event : event.tool, duration: event.duration }))
        : variant === "sessions"
          ? events.map((event, index) => ({ ...event, event: `Session ${index + 1}`, tool: event.session.slice(-6) }))
          : events;
    return renderTablePanel({
      title: "SESSION TABLE",
      titleRight: emptyVariant ? "Empty" : "Selected",
      rows,
      emptyLabel: "No sessions match the selected option",
      selectedIndex: previewIndex,
      footer: "(table footer)",
      width,
      height: previewHeight,
      color,
      accent: active ? theme.cyan : theme.border,
      columns: [
        { label: "TIME", width: 10, render: (row) => row.time.slice(0, 8) },
        { label: "EVENT", width: Math.max(14, width - 44), render: (row) => row.event },
        { label: "RISK", width: 6, render: (row) => row.risk },
        { label: "DUR", width: 6, align: "right", render: (row) => row.duration },
      ],
    });
  }

  if (component.id === "sparkline-chart") {
    const sparkWidth = Math.max(10, Math.min(width - 8, expanded ? 72 : dense ? 28 : 48));
    const lines = emptyVariant
      ? ["No sparkline data", "", "Data: Empty renders the clean chart fallback."]
      : variant === "dash"
        ? ["Dash baseline", "", dashSpark(sparkWidth, theme.amber, color), dim("Used for waiting, paused, or unavailable series.", color)]
        : variant === "comparison"
          ? [
              "Comparison",
              "",
              `${rgb("Current ", theme.green, color)} ${dotSparkline(dynamicSpark, sparkWidth, theme.green, color)}`,
              `${rgb("Previous", theme.cyan, color)} ${dotSparkline(dynamicSpark.slice().reverse(), sparkWidth, theme.cyan, color)}`,
            ]
          : [
              "Dot sparkline",
              "",
              dotSparkline(dynamicSpark, sparkWidth, theme.green, color),
              dim(`points: ${dynamicSpark.length}  size: ${resolved.density}`, color),
            ];
    return renderPanel({
      title: "Sparkline Chart",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "bar-chart") {
    const barWidth = Math.max(10, Math.min(width - 8, expanded ? 72 : dense ? 28 : 48));
    const lines = emptyVariant
      ? ["No bar data", "", "Data: Empty renders the clean chart fallback."]
      : variant === "low-bars"
        ? ["Low bars", "", lowBars(dynamicSpark, barWidth, theme.green, color), dim("Low-amplitude chart for subtle trends.", color)]
        : variant === "stacked"
          ? [
              "Stacked comparison",
              "",
              `${rgb("Read ", theme.green, color)} ${bars(dynamicSpark, barWidth, theme.green, color)}`,
              `${rgb("Edit ", theme.amber, color)} ${bars(dynamicSpark.slice().reverse(), barWidth, theme.amber, color)}`,
              `${rgb("Bash ", theme.red, color)} ${lowBars(dynamicSpark.slice(3), barWidth, theme.red, color)}`,
            ]
          : ["Bars", "", bars(dynamicSpark, barWidth, theme.green, color), dim(`values: ${dynamicSpark.join(", ")}`, color)];
    return renderPanel({
      title: "Bar Chart",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "area-chart") {
    const chartWidth = Math.max(16, Math.min(width - 8, expanded ? 76 : dense ? 32 : 56));
    const chartHeight = expanded ? 10 : dense ? 4 : 7;
    const lines = emptyVariant
      ? ["No area data", "", "Data: Empty renders the clean chart fallback."]
      : variant === "band"
        ? [
            "Range band",
            "",
            ...renderAreaRows(
              dynamicSpark.map((value) => value + 3),
              chartWidth,
              chartHeight,
              color,
              theme.slate
            ),
            ...renderAreaRows(dynamicSpark, chartWidth, Math.max(2, Math.floor(chartHeight / 2)), color, theme.green),
            dim("Upper band + current trend", color),
          ]
        : variant === "compare"
          ? [
              "Area comparison",
              "",
              rgb("Current", theme.green, color),
              ...renderAreaRows(dynamicSpark, chartWidth, Math.max(3, Math.floor(chartHeight / 2)), color, theme.green),
              rgb("Previous", theme.cyan, color),
              ...renderAreaRows(dynamicSpark.slice().reverse(), chartWidth, Math.max(3, Math.floor(chartHeight / 2)), color, theme.cyan),
            ]
          : [
              "Filled volume",
              "",
              ...renderAreaRows(dynamicSpark, chartWidth, chartHeight, color, theme.green),
              dim(`size: ${resolved.density}`, color),
            ];
    return renderPanel({
      title: "Area Chart",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "gauge-chart") {
    const gaugeWidth = Math.max(10, Math.min(width - 24, expanded ? 52 : dense ? 18 : 34));
    const base = emptyVariant ? 0 : 42 + (dataTick % 45);
    const lines = emptyVariant
      ? ["No gauge data", "", renderGauge("Capacity", 0, gaugeWidth, color)]
      : variant === "score"
        ? [
            "Score gauge",
            "",
            renderGauge("Quality", 82 - (dataTick % 12), gaugeWidth, color),
            renderGauge("Coverage", 74 + (dataTick % 8), gaugeWidth, color),
          ]
        : variant === "multi"
          ? [
              "Multiple gauges",
              "",
              renderGauge("CPU", 16 + (dataTick % 20), gaugeWidth, color),
              renderGauge("Memory", 48 + (dataTick % 18), gaugeWidth, color),
              renderGauge("Queue", 62 + (dataTick % 28), gaugeWidth, color),
            ]
          : ["Capacity gauge", "", renderGauge("Capacity", base, gaugeWidth, color), dim("Green <65, amber <85, red >=85", color)];
    return renderPanel({
      title: "Gauge Chart",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "histogram-chart") {
    const histWidth = Math.max(10, Math.min(width - 24, expanded ? 60 : dense ? 24 : 42));
    const values = emptyVariant ? [0, 0, 0, 0, 0] : dynamicSpark.slice(0, 5).map((value, index) => value * (index + 2));
    const labels =
      variant === "risk"
        ? ["low", "med", "high", "block", "deny"]
        : variant === "duration"
          ? ["0-1s", "1-5s", "5-15s", "15-60s", "60s+"]
          : ["0-25", "25-50", "50-100", "100-250", "250+"];
    const lines = emptyVariant
      ? ["No histogram data", "", ...renderHistogramRows(labels, values, histWidth, color)]
      : [
          variant === "duration" ? "Duration buckets" : variant === "risk" ? "Risk buckets" : "Latency buckets",
          "",
          ...renderHistogramRows(labels, values, histWidth, color),
        ];
    return renderPanel({
      title: "Histogram",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "scatter-plot") {
    const plotWidth = Math.max(16, Math.min(width - 8, expanded ? 70 : dense ? 30 : 52));
    const plotHeight = expanded ? 16 : dense ? 8 : 12;
    const points = emptyVariant
      ? []
      : dynamicSpark.map((value, index) => ({
          x: index / Math.max(1, dynamicSpark.length - 1),
          y: ((value + (variant === "throughput-error" ? index : 0)) % 10) / 10,
          selected: variant === "selected" && index === previewIndex % dynamicSpark.length,
        }));
    const lines = emptyVariant
      ? ["No scatter data", "", ...renderScatterRows([], plotWidth, plotHeight, color)]
      : [
          variant === "throughput-error" ? "Throughput / error" : "Latency / risk",
          "",
          ...renderScatterRows(points, plotWidth, plotHeight, color),
          dim("x: time  y: score", color),
        ];
    return renderPanel({
      title: "Scatter Plot",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "distribution-bars") {
    const distWidth = Math.max(10, Math.min(width - 28, expanded ? 58 : dense ? 24 : 40));
    const rows = emptyVariant
      ? []
      : variant === "tools"
        ? [
            { label: "Read", value: 144 + dataTick, tone: "green" as const },
            { label: "Edit", value: 86, tone: "amber" as const },
            { label: "Bash", value: 24 + (dataTick % 8), tone: "red" as const },
          ]
        : variant === "files"
          ? [
              { label: "Modified", value: 64 + dataTick, tone: "green" as const },
              { label: "Created", value: 14, tone: "cyan" as const },
              { label: "Deleted", value: 3 + (dataTick % 4), tone: "red" as const },
            ]
          : [
              { label: "Low", value: 312 + dataTick, tone: "green" as const },
              { label: "Medium", value: 86, tone: "amber" as const },
              { label: "High", value: 24 + (dataTick % 6), tone: "red" as const },
            ];
    const lines = emptyVariant
      ? ["No distribution data", "", "Data: Empty renders the clean chart fallback."]
      : ["Distribution", "", ...renderDistributionRows(rows, distWidth, color)];
    return renderPanel({
      title: "Distribution Bars",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "matrix-grid") {
    const rowLabels =
      variant === "calendar"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri"]
        : variant === "file-activity"
          ? ["src", "tests", "docs", "config"]
          : ["Read", "Edit", "Bash", "Other"];
    const columnLabels =
      variant === "calendar"
        ? ["W1", "W2", "W3", "W4", "W5"]
        : variant === "file-activity"
          ? ["New", "Mod", "Del", "Gen"]
          : ["Low", "Med", "High", "Block"];
    const values = rowLabels.map((_row, rowIndex) =>
      columnLabels.map((_column, columnIndex) =>
        emptyVariant ? 0 : (dynamicSpark[(rowIndex + columnIndex + dataTick) % dynamicSpark.length] ?? 0)
      )
    );
    const lines = [
      emptyVariant
        ? "Empty matrix"
        : variant === "calendar"
          ? "Calendar matrix"
          : variant === "file-activity"
            ? "File activity matrix"
            : "Risk by tool matrix",
      "",
      ...renderMatrixRows(rowLabels, columnLabels, values, color),
      "",
      dim("░ low  ▒ med  ▓ high  █ max", color),
    ];
    return renderPanel({
      title: "Matrix Grid",
      children: lines,
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "pie-donut-chart") {
    const segments = emptyVariant
      ? []
      : variant === "approval"
        ? [
            { label: "Approved", value: 312 + dataTick, color: theme.green },
            { label: "Blocked", value: 27, color: theme.red },
            { label: "Review", value: 18 + (dataTick % 5), color: theme.amber },
          ]
        : variant === "tools"
          ? [
              { label: "Read", value: 144 + dataTick, color: theme.green },
              { label: "Edit", value: 86, color: theme.amber },
              { label: "Bash", value: 24 + (dataTick % 4), color: theme.red },
            ]
          : dynamicSegments;
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    const chartWidth = dense ? 16 : expanded ? 24 : 20;
    const chartHeight = dense ? 6 : expanded ? 10 : 8;
    const donut = emptyVariant
      ? ["No pie chart data", "", "Data: Empty renders the clean chart fallback."]
      : segmentedDonut(segments, { width: chartWidth, height: chartHeight, centerLabel: String(total), centerSubLabel: variant, color });
    const legend = segments.map(
      (segment) => `${rgb("■", segment.color, color)} ${segment.label.padEnd(10)} ${String(segment.value).padStart(4)}`
    );
    return renderPanel({
      title: "Pie / Donut Chart",
      children: [...donut, "", ...legend],
      width,
      height: previewHeight,
      color,
      paddingX: 1,
      accent: active ? theme.cyan : theme.border,
      titleAlign: "left",
    });
  }

  if (component.id === "status-strip-widget") {
    const statusCells = emptyVariant
      ? [{ title: "Ingest", status: "idle", tone: "slate" as const, lines: [{ label: "rate", value: "0/s" }] }]
      : variant === "queue"
        ? [
            {
              title: "Queue",
              status: "watch",
              tone: "amber" as const,
              lines: [
                { label: "depth", value: String(14 + dataTick) },
                { label: "oldest", value: `${8 + dataTick}s`, tone: "amber" as const },
              ],
            },
            { title: "Workers", status: "live", tone: "green" as const, lines: [{ label: "active", value: String(3 + (dataTick % 2)) }] },
          ]
        : variant === "agent"
          ? [
              {
                title: "Agent",
                status: "OK",
                tone: "cyan" as const,
                lines: [{ value: "automation-1" }, { label: "hooks", value: "13/13", tone: "green" as const }],
              },
              { title: "Model", status: "ready", tone: "green" as const, lines: [{ label: "reasoning", value: "medium" }] },
            ]
          : [
              {
                title: "Stream",
                status: "LIVE",
                tone: "green" as const,
                lines: [{ label: "Rate", value: `${124 + dataTick} ev/s`, tone: "green" as const }],
              },
              { title: "Agent", status: "OK", tone: "cyan" as const, lines: [{ value: "automation-1" }] },
              { title: "Hooks", lines: [{ value: `${13 + (dataTick % 3)}/13`, tone: "green" as const }] },
            ];
    return renderStatusStrip({
      width,
      height: previewHeight,
      color,
      active,
      cells: statusCells,
    });
  }

  if (component.id === "key-value-widget") {
    const rows = emptyVariant
      ? []
      : variant === "performance"
        ? [
            { label: "Latency", value: `${31 + dataTick}ms`, tone: "green" as const, sparkValues: dynamicSpark },
            { label: "Rate", value: `${124 + dataTick}/s`, tone: "cyan" as const, sparkValues: dynamicSpark.slice().reverse() },
          ]
        : variant === "queue"
          ? [
              { label: "Backlog", value: String(2 + (dataTick % 6)), tone: "amber" as const, sparkValues: dynamicSpark },
              { label: "Retries", value: String(dataTick % 3), tone: "red" as const, sparkValues: dynamicSpark.slice(2) },
            ]
          : [
              { label: "Model", value: "automation-1", tone: "amber" as const },
              { label: "Context", value: "196,608", sparkValues: dynamicSpark },
              { label: "Reasoning", value: "medium", tone: "cyan" as const },
            ];
    return renderKeyValuePanel({ title: "Key Values", rows, width, height: previewHeight, color, active });
  }

  if (component.id === "timeline-widget") {
    const rows = emptyVariant
      ? []
      : variant === "approval"
        ? dynamicTimeline.map((row, index) => ({
            ...row,
            label: index % 2 ? "Approval" : "Permission",
            detail: index % 2 ? "Approved workspace write" : "Review shell command",
            tone: index % 2 ? ("green" as const) : ("amber" as const),
          }))
        : dynamicTimeline;
    return renderTimelinePanel({
      title: "Timeline",
      rows,
      width,
      height: previewHeight,
      color,
      selectedIndex: previewIndex,
      waterfall: variant === "waterfall" || expanded,
      active,
    });
  }

  if (component.id === "donut-summary-widget") {
    const segments = emptyVariant
      ? []
      : variant === "approval"
        ? [
            { label: "Approved", value: 312 + dataTick, color: theme.green },
            { label: "Blocked", value: 27, color: theme.red },
            { label: "Review", value: 18 + (dataTick % 5), color: theme.amber },
          ]
        : variant === "tools"
          ? [
              { label: "Read", value: 144 + dataTick, color: theme.green },
              { label: "Edit", value: 86, color: theme.amber },
              { label: "Bash", value: 24 + (dataTick % 4), color: theme.red },
            ]
          : dynamicSegments;
    return renderDonutSummaryPanel({
      title: emptyVariant ? "Empty Mix" : "Risk Mix",
      segments,
      totalLabel: String(segments.reduce((sum, segment) => sum + segment.value, 0)),
      subLabel: variant,
      width,
      height: previewHeight,
      color,
      active,
    });
  }

  if (component.id === "heatmap-widget") {
    const labels =
      variant === "files" ? ["src/", "tests/", "docs/"] : variant === "errors" ? ["warn", "fail", "retry"] : ["Read", "Edit", "Bash"];
    const rows = emptyVariant
      ? []
      : labels.map((label, index) => ({ label, values: dynamicSpark.map((value) => ((value + index + dataTick) % 10) / 10) }));
    return renderHeatmapPanel({ title: "Heatmap", rows, width, height: previewHeight, color, active });
  }

  if (component.id === "log-widget") {
    const rows = emptyVariant
      ? []
      : variant === "build"
        ? dynamicTimeline.map((row, index) => ({
            ...row,
            label: index % 2 ? "TEST" : "BUILD",
            detail: index % 2 ? "PASS tui-demo" : "tsc noEmit complete",
            tone: "green" as const,
          }))
        : variant === "permissions"
          ? dynamicTimeline.map((row, index) => ({
              ...row,
              label: index % 2 ? "ALLOW" : "REVIEW",
              detail: index % 2 ? "Workspace edit approved" : "Shell command requested",
              tone: index % 2 ? ("green" as const) : ("amber" as const),
            }))
          : dynamicTimeline;
    return renderLogPanel({ title: "Logs", rows, width, height: previewHeight, color, active });
  }

  const sections = emptyVariant
    ? []
    : variant === "throughput"
      ? [
          { label: "Events", value: `${124 + dataTick}/s`, detail: "stream", tone: "green" as const, values: dynamicSpark },
          {
            label: "Writes",
            value: String(38 + dataTick),
            detail: "files",
            tone: "amber" as const,
            values: dynamicSpark.slice().reverse(),
          },
        ]
      : variant === "quality"
        ? [
            { label: "Errors", value: String(dataTick % 3), detail: "last 30m", tone: "red" as const, values: dynamicSpark },
            {
              label: "Warnings",
              value: String(2 + (dataTick % 4)),
              detail: "last 30m",
              tone: "amber" as const,
              values: dynamicSpark.slice(2),
            },
          ]
        : [
            { label: "CPU", value: `${16 + (dataTick % 20)}%`, detail: "resource", tone: "green" as const, values: dynamicSpark },
            {
              label: "RAM",
              value: `${(1.42 + dataTick / 100).toFixed(2)} GB`,
              detail: "8 GB",
              tone: "cyan" as const,
              values: dynamicSpark.slice(2),
            },
          ];
  return renderSparkSectionsPanel({ title: "Resources", sections, width, height: previewHeight, color, active });
}

function renderKitchenSink(options: TuiDemoRenderOptions): string {
  const width = Math.max(72, Math.floor(options.width));
  const height = Math.max(24, Math.floor(options.height));
  const color = options.color ?? true;
  const { component, index, optionGroupIndex, resolved, previewIndex, focus } = kitchenSinkSelectedComponent(options);
  const focusLabel = focus === "navigation" ? "Components" : focus === "preview" ? "Preview" : "Options";
  const activeGroup = component.optionGroups[optionGroupIndex] ?? component.optionGroups[0];
  const activeChoiceIndex = activeGroup ? kitchenSinkSelectedChoiceIndex(activeGroup.id, resolved) : 0;
  const activeChoice = activeGroup?.choices[activeChoiceIndex];
  const expandedMask = options.interaction?.kitchenSinkExpandedSectionMask ?? kitchenSinkDefaultExpandedSectionMask;
  const navRowCount = buildKitchenSinkNavigationRows(expandedMask).length;
  const navRowIndex = clampIndex(options.interaction?.kitchenSinkNavRowIndex, navRowCount);
  const header = renderBrandHeader({
    title: "prettui",
    subtitle: "TUI component kitchen sink",
    status: [
      rgb("● COMPONENTS", theme.green, color),
      dim(`${index + 1}/${kitchenSinkComponents.length}`, color),
      dim(`Focus ${focusLabel}`, color),
      dim(`${activeGroup?.label ?? "Option"}: ${activeChoice?.label ?? "None"}`, color),
    ],
    width,
    color,
  });
  const headerHeight = header.split("\n").length + 1;
  const footerHeight = 3;
  const bodyHeight = Math.max(12, height - headerHeight - footerHeight);
  const navWidth = Math.min(40, Math.max(28, Math.floor(width * 0.23)));
  const optionsWidth = Math.min(38, Math.max(28, Math.floor(width * 0.24)));
  const previewWidth = Math.max(24, width - navWidth - optionsWidth - 2);
  const body = hstack(
    [
      kitchenSinkNav(index, navRowIndex, expandedMask, navWidth, bodyHeight, color, focus === "navigation"),
      renderKitchenSinkPreview(component, {
        resolved,
        previewIndex,
        tick: options.tick ?? 0,
        width: previewWidth,
        height: bodyHeight,
        color,
        active: focus === "preview",
      }),
      renderKitchenSinkOptions(component, optionGroupIndex, resolved, optionsWidth, bodyHeight, color, focus === "options"),
    ],
    1
  );
  const footer = renderFooter({
    width,
    color,
    status: [
      { label: "Kitchen Sink", value: component.label, tone: "cyan" },
      { label: "Focus", value: focusLabel, tone: "green" },
      { label: "Data", value: resolved.dataMode, tone: resolved.dataMode === "empty" ? "amber" : "white" },
    ],
    controls: ["[q] Quit", "[tab] Focus", "[j/k] Move", "[f/space] Toggle", "[h/l] Value", "[r] Sample", "[esc] Menu"],
  });
  return normalizeFrame([header, body, footer].join("\n"), width, height);
}

export function getTuiDemoEventCount(options: Omit<TuiDemoRenderOptions, "width" | "height" | "color"> = {}): number {
  if (options.choice === "kitchen-sink") return kitchenSinkComponents.length;
  if (options.choice === "mock2") return buildEventExplorer(options).events.length;
  if (options.choice === "mock4") return filteredRows(permissionEvents(options.tick ?? 0), options).length;
  return filteredRows(demoTimeline(options.tick ?? 0), options).length;
}

export function renderTuiDemo(options: TuiDemoRenderOptions): string {
  if (!options.choice || options.choice === "menu") return renderDemoMenu(options);
  if (options.choice === "mock1") return renderChoice1(options);
  if (options.choice === "mock2") return renderChoice2(options);
  if (options.choice === "mock3") return renderChoice3(options);
  if (options.choice === "mock4") return renderChoice4(options);
  return renderKitchenSink(options);
}
