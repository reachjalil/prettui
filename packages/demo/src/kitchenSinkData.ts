import { theme, type Tone } from "@prettui/core";
import type {
  BrandHeaderProps,
  EventStreamRow,
  FileWatcherRow,
  FooterItem,
  HeatmapRow,
  KeyValueRow,
  NavigationItem,
  StatusStripCell,
  SummaryMetric,
  TimelinePanelRow,
} from "@prettui/components";

export type TuiKitchenSinkComponentId =
  | "brand-header"
  | "summary-cards"
  | "navigation-panel"
  | "event-stream"
  | "json-inspector"
  | "file-watcher"
  | "footer"
  | "generic-panel"
  | "table-panel"
  | "layout-dashboard-grid"
  | "layout-master-detail"
  | "layout-triple-pane"
  | "layout-command-center"
  | "layout-responsive-stack"
  | "layout-comparison-board"
  | "layout-scroll-contract"
  | "layout-modal-workflow"
  | "sparkline-chart"
  | "bar-chart"
  | "area-chart"
  | "gauge-chart"
  | "histogram-chart"
  | "scatter-plot"
  | "distribution-bars"
  | "matrix-grid"
  | "pie-donut-chart"
  | "status-strip-widget"
  | "key-value-widget"
  | "timeline-widget"
  | "donut-summary-widget"
  | "heatmap-widget"
  | "log-widget"
  | "spark-sections-widget"
  | "text-widget"
  | "practice-focus-map"
  | "practice-keyboard-model"
  | "practice-state-patterns"
  | "practice-density-scale"
  | "practice-color-tones"
  | "practice-overflow-guard"
  | "practice-data-loading"
  | "practice-error-boundary";

export type TuiKitchenSinkCategory = "chrome" | "dashboard" | "data" | "panel" | "layout" | "analytics" | "practice";
export type KitchenSinkDataMode = "static" | "dynamic" | "empty";
export type KitchenSinkDensity = "compact" | "comfortable" | "expanded";
export type KitchenSinkOptionGroupId = "data" | "variant" | "density";
export type KitchenSinkNavigationSectionId = "core" | "layouts" | "data" | "visualization" | "practices" | "analytics";

export type TuiKitchenSinkOptionChoice = {
  id: string;
  label: string;
  description?: string;
};

export type TuiKitchenSinkOptionGroup = {
  id: KitchenSinkOptionGroupId;
  label: string;
  choices: TuiKitchenSinkOptionChoice[];
  defaultChoiceId: string;
};

export type TuiKitchenSinkTableColumn = {
  id: string;
  label: string;
  width: number;
  align?: "left" | "right";
  field: string;
};

export type TuiKitchenSinkDefinition = {
  id: TuiKitchenSinkComponentId;
  label: string;
  description: string;
  category: TuiKitchenSinkCategory;
  exportName: string;
  optionGroups: TuiKitchenSinkOptionGroup[];
  sample: Record<string, unknown>;
};

const sparkValues = [4, 6, 5, 8, 6, 9, 7, 5, 8, 3, 4, 2, 5, 3, 7, 4, 6, 2];

const dataOptions: TuiKitchenSinkOptionGroup = {
  id: "data",
  label: "Data",
  defaultChoiceId: "static",
  choices: [
    { id: "static", label: "Static", description: "Stable snapshot data for visual review." },
    { id: "dynamic", label: "Dynamic", description: "Values drift with the demo tick." },
    { id: "empty", label: "Empty", description: "Clean no-data state for the component." },
  ],
};

const densityOptions: TuiKitchenSinkOptionGroup = {
  id: "density",
  label: "Size",
  defaultChoiceId: "comfortable",
  choices: [
    { id: "compact", label: "Small", description: "Tighter rows for constrained terminals." },
    { id: "comfortable", label: "Medium", description: "Default review layout." },
    { id: "expanded", label: "Large", description: "Uses more labels, rows, or supporting data." },
  ],
};

function componentOptions(defaultVariantId: string, variants: TuiKitchenSinkOptionChoice[]): TuiKitchenSinkOptionGroup[] {
  return [
    dataOptions,
    {
      id: "variant",
      label: "Variant",
      defaultChoiceId: defaultVariantId,
      choices: variants,
    },
    densityOptions,
  ];
}

const summaryMetrics: SummaryMetric[] = [
  { title: "SESSIONS", value: "3", delta: "+2 in 30m", tone: "green", sparkValues },
  { title: "TOOL CALLS", value: "156", delta: "+23%", tone: "cyan", spark: "bars", sparkValues },
  { title: "APPROVALS", value: "2", delta: "-1 waiting", tone: "amber", spark: "dash" },
  { title: "RISK ALERTS", value: "5", delta: "-2 today", tone: "red", spark: "lowBars", sparkValues: sparkValues.slice().reverse() },
];

const navigationItems: NavigationItem[] = [
  { icon: "⌂", label: "Overview", active: true },
  { icon: "⌘", label: "Hooks" },
  { icon: "⚒", label: "Tools" },
  { icon: "▣", label: "Files" },
  { icon: "◇", label: "Risk" },
];

const eventRows: EventStreamRow[] = [
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
  {
    time: "13:35:11.959",
    event: "PostToolUse",
    session: "sess_01H8Z4J7E8",
    turn: "12",
    tool: "ReadFile",
    risk: "LOW",
    duration: "57ms",
    tone: "green",
  },
  {
    time: "13:35:10.394",
    event: "PermissionRequest",
    session: "sess_01H8Z4J7E8",
    turn: "12",
    tool: "Edit",
    risk: "MED",
    duration: "64ms",
    tone: "amber",
  },
  { time: "13:35:07.053", event: "Stop", session: "sess_01H7Y9C3D2", turn: "8", tool: "-", risk: "HIGH", duration: "-", tone: "red" },
];

const fileRows: FileWatcherRow[] = [
  {
    time: "13:35:12",
    kind: "MODIFIED",
    path: "apps/tui-demo/src/renderDemo.ts",
    delta: "+42 -8",
    fileType: "TypeScript",
    summary: "Adjusted panel rendering",
  },
  {
    time: "13:35:11",
    kind: "CREATED",
    path: "reports/session-risk.ndjson",
    delta: "+1",
    fileType: "NDJSON",
    summary: "Captured approval trace",
  },
  {
    time: "13:35:08",
    kind: "MODIFIED",
    path: ".harness/instructions/root.md",
    delta: "+6 -2",
    fileType: "Markdown",
    summary: "Updated harness guidance",
  },
];

const timelineRows: TimelinePanelRow[] = [
  { time: "13:35:30", label: "SessionStart", detail: "Session initiated", tone: "green", position: 0.08 },
  { time: "13:35:27", label: "PermissionRequest", detail: "Edit src/stream/runner.ts", tone: "amber", position: 0.48 },
  { time: "13:35:23", label: "PostToolUse", detail: "Tool: Edit success", tone: "green", position: 0.62 },
  { time: "13:35:11", label: "Stop", detail: "Session completed", tone: "red", position: 0.94 },
];

const statusItems: FooterItem[] = [
  { label: "Status", value: "Connected", tone: "green" },
  { label: "Events", value: "1,251", tone: "white" },
  { label: "Warnings", value: "2", tone: "amber" },
];

const tableColumns: TuiKitchenSinkTableColumn[] = [
  { id: "name", label: "NAME", width: 20, field: "name" },
  { id: "status", label: "STATUS", width: 10, field: "status" },
  { id: "latency", label: "LATENCY", width: 8, align: "right", field: "latency" },
];

const heatmapRows: HeatmapRow[] = [
  { label: "Read", values: [0.1, 0.2, 0.36, 0.42, 0.58, 0.62, 0.31, 0.2] },
  { label: "Edit", values: [0.04, 0.12, 0.25, 0.72, 0.81, 0.64, 0.28, 0.16] },
  { label: "Bash", values: [0.02, 0.06, 0.18, 0.32, 0.47, 0.9, 0.54, 0.22] },
];

export const tuiKitchenSinkDefinitions = [
  {
    id: "brand-header",
    label: "Brand Header",
    description: "Top-level product mark, subtitle, and session status row.",
    category: "chrome",
    exportName: "renderBrandHeader",
    optionGroups: componentOptions("default", [
      { id: "default", label: "prettui", description: "Dot wordmark with live product status." },
      { id: "library", label: "prettui", description: "Package-oriented title and workspace state." },
      { id: "minimal", label: "Minimal", description: "Plain title with compact status copy." },
    ]),
    sample: {
      title: "prettui",
      subtitle: "terminal automation realtime analytics TUI",
      mark: ["H X", " X ", "H X"],
      status: ["v0.1.0", "CONNECTED", "Workspace: ~/projects/example", "Profile: default"],
    } satisfies Omit<BrandHeaderProps, "width" | "color">,
  },
  {
    id: "summary-cards",
    label: "Summary Cards",
    description: "Metric cards with deltas and compact spark visuals.",
    category: "dashboard",
    exportName: "renderSummaryCards",
    optionGroups: componentOptions("operations", [
      { id: "operations", label: "Operations", description: "Sessions, approvals, and risk metrics." },
      { id: "risk", label: "Risk", description: "Risk-heavy review cards." },
      { id: "capacity", label: "Capacity", description: "Throughput and resource cards." },
    ]),
    sample: { metrics: summaryMetrics },
  },
  {
    id: "navigation-panel",
    label: "Navigation Panel",
    description: "Left rail navigation with simple filter rows and search hint.",
    category: "dashboard",
    exportName: "renderNavigationPanel",
    optionGroups: componentOptions("full-rail", [
      { id: "full-rail", label: "Full Rail", description: "Navigation, filters, and search hint." },
      { id: "filters", label: "Filters", description: "Filter-heavy review state." },
      { id: "minimal", label: "Minimal", description: "Navigation without filters." },
    ]),
    sample: {
      items: navigationItems,
      filters: [
        { label: "Session", value: "Main" },
        { label: "Risk", value: "All" },
        { label: "Since", value: "30m ago" },
      ],
      searchHint: "Search: hooks",
    },
  },
  {
    id: "event-stream",
    label: "Event Stream",
    description: "Live hook event table with risk, tool, and duration columns.",
    category: "data",
    exportName: "renderEventStreamPanel",
    optionGroups: componentOptions("mixed-risk", [
      { id: "mixed-risk", label: "Mixed Risk", description: "Balanced low, medium, and high rows." },
      { id: "high-risk", label: "High Risk", description: "Permission and blocked-command rows." },
      { id: "low-risk", label: "Low Risk", description: "Routine successful tool activity." },
    ]),
    sample: { rows: eventRows, filter: "All", selectedIndex: 1 },
  },
  {
    id: "json-inspector",
    label: "JSON Inspector",
    description: "Structured event payload preview with an optional risk mix.",
    category: "data",
    exportName: "renderJsonInspectorPanel",
    optionGroups: componentOptions("tool-payload", [
      { id: "tool-payload", label: "Tool Payload", description: "Detailed tool event object." },
      { id: "risk-mix", label: "Risk Mix", description: "JSON plus donut summary." },
      { id: "compact-json", label: "Compact JSON", description: "Small object for constrained panes." },
    ]),
    sample: {
      title: "EVENT INSPECTOR",
      id: "evt_01H8Z4J7E8_0000C1F6",
      value: {
        hook_event_name: "PermissionRequest",
        session_id: "sess_01H8Z4J7E8",
        tool_name: "Edit",
        decision: "approved",
        duration_ms: 64,
      },
      riskMix: {
        total: "422",
        subLabel: "Risk",
        segments: [
          { label: "Low", value: 312, color: theme.green },
          { label: "Medium", value: 86, color: theme.amber },
          { label: "High", value: 24, color: theme.red },
        ],
        legend: ["Low 312 74%", "Medium 86 20%", "High 24 6%"],
      },
    },
  },
  {
    id: "file-watcher",
    label: "File Watcher",
    description: "Recent file activity table for session-side filesystem changes.",
    category: "data",
    exportName: "renderFileWatcherPanel",
    optionGroups: componentOptions("source-files", [
      { id: "source-files", label: "Source Files", description: "Editor and package source changes." },
      { id: "generated", label: "Generated", description: "Build artifacts and reports." },
      { id: "deletions", label: "Deletions", description: "Delete-heavy activity review." },
    ]),
    sample: { rows: fileRows, watching: "~/projects/example" },
  },
  {
    id: "footer",
    label: "Footer",
    description: "Status cells and keyboard control hints.",
    category: "chrome",
    exportName: "renderFooter",
    optionGroups: componentOptions("commands", [
      { id: "commands", label: "Commands", description: "Shortcut-heavy footer." },
      { id: "status", label: "Status", description: "Status-heavy footer." },
      { id: "warning", label: "Warning", description: "Warning and error tones." },
    ]),
    sample: { status: statusItems, controls: ["[q] Quit", "[p] Pause", "[/] Search", "[tab] Focus"] },
  },
  {
    id: "generic-panel",
    label: "Generic Panel",
    description: "Bounded panel shell for arbitrary line-oriented content.",
    category: "panel",
    exportName: "renderPanel",
    optionGroups: componentOptions("notes", [
      { id: "notes", label: "Notes", description: "Short line-oriented content." },
      { id: "checklist", label: "Checklist", description: "Review checklist content." },
      { id: "warning", label: "Warning", description: "Warning copy with accent border." },
    ]),
    sample: { title: "SESSION NOTES", children: ["Active session sess_01H8Z4J7E8", "Renderer can supply any prepared lines."] },
  },
  {
    id: "table-panel",
    label: "Table Panel",
    description: "Generic typed rows and columns for compact tabular previews.",
    category: "panel",
    exportName: "renderTablePanel",
    optionGroups: componentOptions("services", [
      { id: "services", label: "Services", description: "Service health rows." },
      { id: "tools", label: "Tools", description: "Tool execution rows." },
      { id: "sessions", label: "Sessions", description: "Session summary rows." },
    ]),
    sample: {
      title: "SERVICE HEALTH",
      columns: tableColumns,
      rows: [
        { name: "hook-ingest", status: "healthy", latency: "42ms" },
        { name: "event-index", status: "warming", latency: "91ms" },
        { name: "approval-log", status: "healthy", latency: "36ms" },
      ],
      selectedIndex: 0,
    },
  },
  {
    id: "layout-dashboard-grid",
    label: "Dashboard Grid",
    description: "Balanced dashboard shell with metrics, charts, stream rows, and detail panes.",
    category: "layout",
    exportName: "layout recipe",
    optionGroups: componentOptions("overview", [
      { id: "overview", label: "Overview", description: "Balanced two-row dashboard composition." },
      { id: "dense", label: "Dense", description: "More panels with tighter vertical rhythm." },
      { id: "wide", label: "Wide", description: "Wide hero chart with supporting side panels." },
    ]),
    sample: { recipe: "dashboard-grid", panes: ["metrics", "chart", "stream", "detail"] },
  },
  {
    id: "layout-master-detail",
    label: "Master Detail",
    description: "List plus selected record detail, with optional comparison and inspector modes.",
    category: "layout",
    exportName: "layout recipe",
    optionGroups: componentOptions("list-detail", [
      { id: "list-detail", label: "List/Detail", description: "Primary list controls the detail pane." },
      { id: "inspector", label: "Inspector", description: "Adds right-side metadata and actions." },
      { id: "compare", label: "Compare", description: "Shows selected and previous records side by side." },
    ]),
    sample: { recipe: "master-detail", panes: ["master", "detail", "inspector"] },
  },
  {
    id: "layout-triple-pane",
    label: "Triple Pane",
    description: "Explorer, work surface, and inspector frame for advanced operations consoles.",
    category: "layout",
    exportName: "layout recipe",
    optionGroups: componentOptions("explorer", [
      { id: "explorer", label: "Explorer", description: "Navigation, main work area, and inspector." },
      { id: "resizable", label: "Resizable", description: "Shows pane resize and min-width contracts." },
      { id: "collapsed", label: "Collapsed", description: "Inspector collapsed into a compact rail." },
    ]),
    sample: { recipe: "triple-pane", panes: ["nav", "main", "inspector"] },
  },
  {
    id: "layout-command-center",
    label: "Command Center",
    description: "Operations layout for status, queue triage, live stream, and action history.",
    category: "layout",
    exportName: "layout recipe",
    optionGroups: componentOptions("operations", [
      { id: "operations", label: "Ops", description: "Live operational monitoring layout." },
      { id: "incident", label: "Incident", description: "Escalation timeline and decision queue." },
      { id: "approvals", label: "Approvals", description: "Approval workflow with risk context." },
    ]),
    sample: { recipe: "command-center", panes: ["status", "queue", "timeline", "actions"] },
  },
  {
    id: "layout-responsive-stack",
    label: "Responsive Stack",
    description: "How advanced TUI shells reflow from desktop-width panes to narrow stacks.",
    category: "layout",
    exportName: "layout recipe",
    optionGroups: componentOptions("desktop", [
      { id: "desktop", label: "Desktop", description: "Three-column layout for wide terminals." },
      { id: "tablet", label: "Tablet", description: "Two-column layout with stacked detail." },
      { id: "narrow", label: "Narrow", description: "Single-column stack for small terminals." },
    ]),
    sample: { recipe: "responsive-stack", breakpoints: ["wide", "medium", "narrow"] },
  },
  {
    id: "layout-comparison-board",
    label: "Comparison Board",
    description: "Side-by-side layout for comparing runs, sessions, models, or file states.",
    category: "layout",
    exportName: "layout recipe",
    optionGroups: componentOptions("runs", [
      { id: "runs", label: "Runs", description: "Compare two execution runs." },
      { id: "models", label: "Models", description: "Compare model behavior and cost." },
      { id: "files", label: "Files", description: "Compare file states and summaries." },
    ]),
    sample: { recipe: "comparison-board", panes: ["baseline", "candidate", "diff"] },
  },
  {
    id: "layout-scroll-contract",
    label: "Scroll Contract",
    description: "Explicit scroll-owner layout for stable terminal frames with nested panes.",
    category: "layout",
    exportName: "layout recipe",
    optionGroups: componentOptions("ownership", [
      { id: "ownership", label: "Owners", description: "Names each scroll owner in the frame." },
      { id: "sticky", label: "Sticky", description: "Keeps header, footer, and controls fixed." },
      { id: "overflow", label: "Overflow", description: "Shows truncation and clipping rules." },
    ]),
    sample: { recipe: "scroll-contract", owners: ["root", "nav", "preview", "options"] },
  },
  {
    id: "layout-modal-workflow",
    label: "Modal Workflow",
    description: "Focused overlay flow for confirmations, command palettes, and destructive actions.",
    category: "layout",
    exportName: "layout recipe",
    optionGroups: componentOptions("command", [
      { id: "command", label: "Command", description: "Command palette overlay with results." },
      { id: "confirm", label: "Confirm", description: "Confirmation dialog with clear actions." },
      { id: "wizard", label: "Wizard", description: "Step-by-step modal workflow." },
    ]),
    sample: { recipe: "modal-workflow", flows: ["command", "confirm", "wizard"] },
  },
  {
    id: "sparkline-chart",
    label: "Sparkline Chart",
    description: "Primitive sparkline chart variants used inside metric widgets.",
    category: "analytics",
    exportName: "dotSparkline | dashSpark",
    optionGroups: componentOptions("dots", [
      { id: "dots", label: "Dots", description: "Braille-style dot sparkline." },
      { id: "dash", label: "Dash", description: "Flat dash baseline state." },
      { id: "comparison", label: "Compare", description: "Two sparkline series side by side." },
    ]),
    sample: { values: sparkValues },
  },
  {
    id: "bar-chart",
    label: "Bar Chart",
    description: "Primitive bar chart variants for compact quantitative data.",
    category: "analytics",
    exportName: "bars | lowBars",
    optionGroups: componentOptions("bars", [
      { id: "bars", label: "Bars", description: "Full-height bar spark chart." },
      { id: "low-bars", label: "Low Bars", description: "Low-amplitude bar chart." },
      { id: "stacked", label: "Stacked", description: "Grouped bar rows for comparison." },
    ]),
    sample: { values: sparkValues },
  },
  {
    id: "area-chart",
    label: "Area Chart",
    description: "Filled terminal trend charts for volume and range review.",
    category: "analytics",
    exportName: "demo areaChart",
    optionGroups: componentOptions("volume", [
      { id: "volume", label: "Volume", description: "Single filled trend over time." },
      { id: "band", label: "Band", description: "Min/max band with current value." },
      { id: "compare", label: "Compare", description: "Two filled trends for comparison." },
    ]),
    sample: { values: sparkValues },
  },
  {
    id: "gauge-chart",
    label: "Gauge Chart",
    description: "Threshold-aware gauges and progress meters.",
    category: "analytics",
    exportName: "demo gaugeChart",
    optionGroups: componentOptions("capacity", [
      { id: "capacity", label: "Capacity", description: "Capacity gauge with safe/warn/full zones." },
      { id: "score", label: "Score", description: "Normalized score gauge." },
      { id: "multi", label: "Multi", description: "Multiple compact gauges stacked together." },
    ]),
    sample: { values: sparkValues },
  },
  {
    id: "histogram-chart",
    label: "Histogram",
    description: "Bucketed frequency views for durations and counts.",
    category: "analytics",
    exportName: "demo histogramChart",
    optionGroups: componentOptions("latency", [
      { id: "latency", label: "Latency", description: "Latency bucket distribution." },
      { id: "duration", label: "Duration", description: "Tool duration bucket distribution." },
      { id: "risk", label: "Risk", description: "Risk count bucket distribution." },
    ]),
    sample: { values: sparkValues },
  },
  {
    id: "scatter-plot",
    label: "Scatter Plot",
    description: "Two-axis terminal point plots for outlier review.",
    category: "analytics",
    exportName: "demo scatterPlot",
    optionGroups: componentOptions("latency-risk", [
      { id: "latency-risk", label: "Latency/Risk", description: "Latency against risk score." },
      { id: "throughput-error", label: "Throughput/Error", description: "Throughput against error rate." },
      { id: "selected", label: "Selected", description: "Highlights a selected point." },
    ]),
    sample: { values: sparkValues },
  },
  {
    id: "distribution-bars",
    label: "Distribution Bars",
    description: "Labeled proportional bars with values and percentages.",
    category: "analytics",
    exportName: "demo distributionBars",
    optionGroups: componentOptions("risk", [
      { id: "risk", label: "Risk", description: "Risk level distribution." },
      { id: "tools", label: "Tools", description: "Tool category distribution." },
      { id: "files", label: "Files", description: "File activity distribution." },
    ]),
    sample: { values: sparkValues },
  },
  {
    id: "matrix-grid",
    label: "Matrix Grid",
    description: "Compact matrix views for categorical cross-tabs.",
    category: "analytics",
    exportName: "demo matrixGrid",
    optionGroups: componentOptions("risk-tool", [
      { id: "risk-tool", label: "Risk/Tool", description: "Risk level by tool category." },
      { id: "file-activity", label: "File Activity", description: "File action by package area." },
      { id: "calendar", label: "Calendar", description: "Calendar-like activity matrix." },
    ]),
    sample: { values: sparkValues },
  },
  {
    id: "pie-donut-chart",
    label: "Pie / Donut Chart",
    description: "Segmented proportional chart with center label and legend.",
    category: "analytics",
    exportName: "segmentedDonut",
    optionGroups: componentOptions("risk", [
      { id: "risk", label: "Risk", description: "Low, medium, and high distribution." },
      { id: "approval", label: "Approval", description: "Approval decision distribution." },
      { id: "tools", label: "Tools", description: "Tool category distribution." },
    ]),
    sample: {
      segments: [
        { label: "Low", value: 312, color: theme.green },
        { label: "Medium", value: 86, color: theme.amber },
        { label: "High", value: 24, color: theme.red },
      ],
    },
  },
  {
    id: "status-strip-widget",
    label: "Status Strip Widget",
    description: "Analytics cells for high-level service or session health.",
    category: "analytics",
    exportName: "renderStatusStrip",
    optionGroups: componentOptions("services", [
      { id: "services", label: "Services", description: "Service status cells." },
      { id: "queue", label: "Queue", description: "Queue depth and lag cells." },
      { id: "agent", label: "Agent", description: "Model and hook readiness cells." },
    ]),
    sample: {
      cells: [
        {
          title: "Ingest",
          status: "live",
          tone: "green",
          lines: [
            { label: "rate", value: "48/s" },
            { label: "lag", value: "120ms", tone: "cyan" },
          ],
        },
        {
          title: "Queue",
          status: "watch",
          tone: "amber",
          lines: [
            { label: "depth", value: "14" },
            { label: "oldest", value: "8s", tone: "amber" },
          ],
        },
      ] satisfies StatusStripCell[],
    },
  },
  {
    id: "key-value-widget",
    label: "Key Value Widget",
    description: "Compact key/value facts with optional sparklines.",
    category: "analytics",
    exportName: "renderKeyValuePanel",
    optionGroups: componentOptions("model", [
      { id: "model", label: "Model", description: "Model and context facts." },
      { id: "performance", label: "Perf", description: "Latency and throughput facts." },
      { id: "queue", label: "Queue", description: "Backlog and retry facts." },
    ]),
    sample: {
      title: "MODEL",
      rows: [
        { label: "Model", value: "automation-1", tone: "amber" },
        { label: "Context", value: "196,608", sparkValues },
        { label: "Reasoning", value: "medium", tone: "cyan" },
      ] satisfies KeyValueRow[],
    },
  },
  {
    id: "timeline-widget",
    label: "Timeline Widget",
    description: "Event lifecycle list with optional waterfall positioning.",
    category: "analytics",
    exportName: "renderTimelinePanel",
    optionGroups: componentOptions("lifecycle", [
      { id: "lifecycle", label: "Lifecycle", description: "Session event lifecycle." },
      { id: "waterfall", label: "Waterfall", description: "Timeline with positional plot." },
      { id: "approval", label: "Approval", description: "Permission workflow events." },
    ]),
    sample: { title: "LIFECYCLE", rows: timelineRows, selectedIndex: 1, filterLabel: "All", waterfall: true },
  },
  {
    id: "donut-summary-widget",
    label: "Donut Summary Widget",
    description: "Segmented proportional summary with legend-ready values.",
    category: "analytics",
    exportName: "renderDonutSummaryPanel",
    optionGroups: componentOptions("risk", [
      { id: "risk", label: "Risk", description: "Low, medium, and high mix." },
      { id: "approval", label: "Approval", description: "Approval decision mix." },
      { id: "tools", label: "Tools", description: "Tool category mix." },
    ]),
    sample: {
      title: "APPROVAL STATS",
      totalLabel: "422",
      subLabel: "24h",
      segments: [
        { label: "Read", value: 312, color: theme.green },
        { label: "Write", value: 86, color: theme.amber },
        { label: "Bash", value: 24, color: theme.red },
      ],
    },
  },
  {
    id: "heatmap-widget",
    label: "Heatmap Widget",
    description: "Small multiple activity heatmap rows.",
    category: "analytics",
    exportName: "renderHeatmapPanel",
    optionGroups: componentOptions("tools", [
      { id: "tools", label: "Tools", description: "Tool intensity rows." },
      { id: "files", label: "Files", description: "File area intensity rows." },
      { id: "errors", label: "Errors", description: "Warning and error intensity." },
    ]),
    sample: { title: "TOOL HEATMAP", rows: heatmapRows },
  },
  {
    id: "log-widget",
    label: "Log Widget",
    description: "Dense append-only log preview based on timeline rows.",
    category: "analytics",
    exportName: "renderLogPanel",
    optionGroups: componentOptions("hooks", [
      { id: "hooks", label: "Hooks", description: "Hook event log rows." },
      { id: "build", label: "Build", description: "Build and test log rows." },
      { id: "permissions", label: "Perms", description: "Permission log rows." },
    ]),
    sample: { title: "HOOK LOG", rows: timelineRows },
  },
  {
    id: "spark-sections-widget",
    label: "Spark Sections Widget",
    description: "Grouped spark bars for side-by-side operational slices.",
    category: "analytics",
    exportName: "renderSparkSectionsPanel",
    optionGroups: componentOptions("resources", [
      { id: "resources", label: "Resources", description: "CPU, RAM, and disk sections." },
      { id: "throughput", label: "Throughput", description: "Events and writes sections." },
      { id: "quality", label: "Quality", description: "Errors and warnings sections." },
    ]),
    sample: {
      title: "STREAM LOAD",
      sections: [
        { label: "Events", value: "1.2k", detail: "last 30m", tone: "green" as Tone, values: sparkValues },
        { label: "Writes", value: "38", detail: "changed files", tone: "amber" as Tone, values: sparkValues.slice().reverse() },
      ],
    },
  },
  {
    id: "text-widget",
    label: "Text Widget",
    description: "Plain text analytics panel for prepared summaries.",
    category: "analytics",
    exportName: "renderTextPanel",
    optionGroups: componentOptions("prompt", [
      { id: "prompt", label: "Prompt", description: "Prompt excerpt text." },
      { id: "approval", label: "Approval", description: "Approval decision text." },
      { id: "notice", label: "Notice", description: "Operational notice text." },
    ]),
    sample: {
      title: "PROMPT",
      tone: "green",
      lines: ["> Add realtime analytics for terminal automation hooks", "Include sessions, tools, permissions, and file changes."],
    },
  },
  {
    id: "practice-focus-map",
    label: "Focus Map",
    description: "Focus-zone guide for roving selection, pane handoff, and modal capture.",
    category: "practice",
    exportName: "best practice",
    optionGroups: componentOptions("zones", [
      { id: "zones", label: "Zones", description: "Named focus zones with predictable tab order." },
      { id: "roving", label: "Roving", description: "Single active item per collection." },
      { id: "modal", label: "Modal", description: "Temporary focus capture and restore." },
    ]),
    sample: { practice: "focus-map", zones: ["navigation", "main", "options"] },
  },
  {
    id: "practice-keyboard-model",
    label: "Keyboard Model",
    description: "Keyboard contract for global commands, focus navigation, and value editing.",
    category: "practice",
    exportName: "best practice",
    optionGroups: componentOptions("navigation", [
      { id: "navigation", label: "Navigate", description: "Movement keys and focus traversal." },
      { id: "editing", label: "Editing", description: "Field value changes and commit/cancel." },
      { id: "global", label: "Global", description: "App-wide shortcuts and priority rules." },
    ]),
    sample: { practice: "keyboard-model", keys: ["tab", "j/k", "h/l", "enter", "esc"] },
  },
  {
    id: "practice-state-patterns",
    label: "State Patterns",
    description: "Clean empty, loading, partial, and error states for line-oriented panels.",
    category: "practice",
    exportName: "best practice",
    optionGroups: componentOptions("empty", [
      { id: "empty", label: "Empty", description: "Clear no-data state with next action." },
      { id: "loading", label: "Loading", description: "Stable skeleton that does not resize panes." },
      { id: "error", label: "Error", description: "Actionable error state with recovery path." },
    ]),
    sample: { practice: "state-patterns", states: ["empty", "loading", "error"] },
  },
  {
    id: "practice-density-scale",
    label: "Density Scale",
    description: "Row height, padding, and information hierarchy across compact and expanded modes.",
    category: "practice",
    exportName: "best practice",
    optionGroups: componentOptions("row-rhythm", [
      { id: "row-rhythm", label: "Rows", description: "Consistent row heights and gutters." },
      { id: "information", label: "Info", description: "What appears at each density." },
      { id: "touchpoints", label: "Targets", description: "Interactive target size and spacing." },
    ]),
    sample: { practice: "density-scale", sizes: ["small", "medium", "large"] },
  },
  {
    id: "practice-color-tones",
    label: "Color Tones",
    description: "Semantic terminal color system for status, risk, selection, and disabled text.",
    category: "practice",
    exportName: "best practice",
    optionGroups: componentOptions("semantic", [
      { id: "semantic", label: "Semantic", description: "Stable meanings for green, amber, red, cyan." },
      { id: "risk", label: "Risk", description: "Risk and approval emphasis." },
      { id: "status", label: "Status", description: "Service health and lifecycle states." },
    ]),
    sample: { practice: "color-tones", tones: ["green", "amber", "red", "cyan", "slate"] },
  },
  {
    id: "practice-overflow-guard",
    label: "Overflow Guard",
    description: "Truncation, clipping, and min-width rules that keep TUI frames stable.",
    category: "practice",
    exportName: "best practice",
    optionGroups: componentOptions("truncate", [
      { id: "truncate", label: "Truncate", description: "Long labels fit without resizing panes." },
      { id: "wrap", label: "Wrap", description: "Short prose wraps inside known row budgets." },
      { id: "priority", label: "Priority", description: "Drops low-priority metadata first." },
    ]),
    sample: { practice: "overflow-guard", rules: ["fitAnsi", "fixed columns", "priority metadata"] },
  },
  {
    id: "practice-data-loading",
    label: "Data Loading",
    description: "Live, stale, optimistic, and reconnecting data states for streaming TUIs.",
    category: "practice",
    exportName: "best practice",
    optionGroups: componentOptions("live", [
      { id: "live", label: "Live", description: "Fresh stream data with timestamp context." },
      { id: "stale", label: "Stale", description: "Readable stale data with age indicator." },
      { id: "optimistic", label: "Optimistic", description: "Pending local action before confirmation." },
    ]),
    sample: { practice: "data-loading", states: ["live", "stale", "optimistic"] },
  },
  {
    id: "practice-error-boundary",
    label: "Error Boundary",
    description: "Recoverable panel failures that preserve the shell and neighboring panes.",
    category: "practice",
    exportName: "best practice",
    optionGroups: componentOptions("panel", [
      { id: "panel", label: "Panel", description: "One panel fails without blanking the shell." },
      { id: "section", label: "Section", description: "Section-level fallback and retry." },
      { id: "app", label: "App", description: "Top-level fallback with session recovery." },
    ]),
    sample: { practice: "error-boundary", scopes: ["panel", "section", "app"] },
  },
] as const satisfies readonly TuiKitchenSinkDefinition[];

export const tuiKitchenSinkComponentIds = tuiKitchenSinkDefinitions.map((definition) => definition.id);

export type KitchenSinkComponentDemo = TuiKitchenSinkDefinition;

export const kitchenSinkComponents = tuiKitchenSinkDefinitions;
export const kitchenSinkSpark = sparkValues;
export const kitchenSinkEvents = eventRows;
export const kitchenSinkTimelineRows = timelineRows;
export const kitchenSinkSegments = [
  { label: "Low", value: 312, color: theme.green },
  { label: "Medium", value: 86, color: theme.amber },
  { label: "High", value: 24, color: theme.red },
];

export type KitchenSinkNavigationSection = {
  id: KitchenSinkNavigationSectionId;
  label: string;
  componentIds: TuiKitchenSinkComponentId[];
};

export type KitchenSinkNavigationRow =
  | { kind: "section"; sectionIndex: number; section: KitchenSinkNavigationSection; expanded: boolean }
  | { kind: "component"; sectionIndex: number; componentIndex: number; component: KitchenSinkComponentDemo };

export const kitchenSinkNavigationSections: KitchenSinkNavigationSection[] = [
  {
    id: "core",
    label: "Core Components",
    componentIds: ["brand-header", "navigation-panel", "footer", "generic-panel", "table-panel"],
  },
  {
    id: "layouts",
    label: "Layout Patterns",
    componentIds: [
      "layout-dashboard-grid",
      "layout-master-detail",
      "layout-triple-pane",
      "layout-command-center",
      "layout-responsive-stack",
      "layout-comparison-board",
      "layout-scroll-contract",
      "layout-modal-workflow",
    ],
  },
  {
    id: "data",
    label: "Data Surfaces",
    componentIds: ["event-stream", "json-inspector", "file-watcher"],
  },
  {
    id: "visualization",
    label: "Data Visualization",
    componentIds: [
      "summary-cards",
      "sparkline-chart",
      "bar-chart",
      "area-chart",
      "gauge-chart",
      "histogram-chart",
      "scatter-plot",
      "distribution-bars",
      "matrix-grid",
      "pie-donut-chart",
      "donut-summary-widget",
      "heatmap-widget",
      "timeline-widget",
      "spark-sections-widget",
    ],
  },
  {
    id: "analytics",
    label: "Analytics Widgets",
    componentIds: ["status-strip-widget", "key-value-widget", "log-widget", "text-widget"],
  },
  {
    id: "practices",
    label: "Best Practices",
    componentIds: [
      "practice-focus-map",
      "practice-keyboard-model",
      "practice-state-patterns",
      "practice-density-scale",
      "practice-color-tones",
      "practice-overflow-guard",
      "practice-data-loading",
      "practice-error-boundary",
    ],
  },
];

export const kitchenSinkDefaultExpandedSectionMask = kitchenSinkNavigationSections.reduce(
  (mask, _section, index) => mask | (1 << index),
  0
);

export function kitchenSinkComponentIndexById(id: TuiKitchenSinkComponentId): number {
  return kitchenSinkComponents.findIndex((component) => component.id === id);
}

export function buildKitchenSinkNavigationRows(expandedMask: number): KitchenSinkNavigationRow[] {
  const rows: KitchenSinkNavigationRow[] = [];

  for (let sectionIndex = 0; sectionIndex < kitchenSinkNavigationSections.length; sectionIndex += 1) {
    const section = kitchenSinkNavigationSections[sectionIndex];
    const expanded = (expandedMask & (1 << sectionIndex)) !== 0;
    rows.push({ kind: "section", sectionIndex, section, expanded });

    if (!expanded) continue;
    for (const componentId of section.componentIds) {
      const componentIndex = kitchenSinkComponentIndexById(componentId);
      const component = kitchenSinkComponents[componentIndex];
      if (componentIndex >= 0 && component) rows.push({ kind: "component", sectionIndex, componentIndex, component });
    }
  }

  return rows;
}
