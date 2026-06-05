import { dim, rgb, theme } from "./ansi";
import { hstack, normalizeFrame, splitRatioWidths } from "./layout";
import {
  renderBrandHeader,
  renderEventStreamPanel,
  renderFileWatcherPanel,
  renderFooter,
  renderJsonInspectorPanel,
  renderNavigationPanel,
  renderSummaryCards,
  summaryCardColumns,
  type BrandHeaderProps,
  type EventStreamRow,
  type FileWatcherRow,
  type FilterRow,
  type FooterItem,
  type NavigationItem,
  type SummaryMetric,
} from "./components";
import type { DonutSegment } from "./charts";

export type TuiDashboardPanelId = "navigation" | "eventStream" | "inspector" | "fileWatcher";

export type TuiDashboardProps = {
  width: number;
  height: number;
  color?: boolean;
  brand: Pick<BrandHeaderProps, "title" | "subtitle" | "mark"> & {
    version?: string;
    workspace?: string;
    profile?: string;
    connected?: boolean;
  };
  metrics: SummaryMetric[];
  navigation: {
    items: NavigationItem[];
    filters?: FilterRow[];
    searchHint?: string;
  };
  events: EventStreamRow[];
  inspector: {
    title: string;
    id: string;
    value: unknown;
    riskMix?: { total: string; subLabel: string; segments: DonutSegment[]; legend: string[] };
  };
  files: FileWatcherRow[];
  footer: {
    status: FooterItem[];
    controls: string[];
  };
  state?: {
    activePanel?: TuiDashboardPanelId;
    eventFilter?: string;
    selectedEventIndex?: number;
  };
};

function renderMain(props: TuiDashboardProps, width: number, height: number, color: boolean): string {
  const activePanel = props.state?.activePanel ?? "eventStream";
  const eventFilter = props.state?.eventFilter ?? "All";
  const selectedEventIndex = Math.max(0, Math.floor(props.state?.selectedEventIndex ?? 0));

  if (width >= 146) {
    const [navWidth = 30, streamWidth = 86, inspectorWidth = 50] = splitRatioWidths(width, [30, 90, 54], 1, [28, 72, 44]);
    return hstack(
      [
        renderNavigationPanel({ ...props.navigation, width: navWidth, height, active: activePanel === "navigation", color }),
        renderEventStreamPanel({
          rows: props.events,
          width: streamWidth,
          height,
          filter: eventFilter,
          selectedIndex: selectedEventIndex,
          active: activePanel === "eventStream",
          color,
        }),
        renderJsonInspectorPanel({ ...props.inspector, width: inspectorWidth, height, active: activePanel === "inspector", color }),
      ],
      1
    );
  }

  if (width >= 98) {
    const navWidth = 28;
    return hstack(
      [
        renderNavigationPanel({ ...props.navigation, width: navWidth, height, active: activePanel === "navigation", color }),
        renderEventStreamPanel({
          rows: props.events,
          width: width - navWidth - 1,
          height,
          filter: eventFilter,
          selectedIndex: selectedEventIndex,
          active: activePanel === "eventStream",
          color,
        }),
      ],
      1
    );
  }

  return renderEventStreamPanel({
    rows: props.events,
    width,
    height,
    filter: eventFilter,
    selectedIndex: selectedEventIndex,
    active: true,
    color,
  });
}

export function renderTuiDashboard(props: TuiDashboardProps): string {
  const width = Math.max(56, Math.floor(props.width));
  const height = Math.max(18, Math.floor(props.height));
  const color = props.color ?? true;
  const status = [
    dim(props.brand.version ?? "v0.1.0", color),
    rgb(
      props.brand.connected === false ? "○ DISCONNECTED" : "● CONNECTED",
      props.brand.connected === false ? theme.amber : theme.green,
      color
    ),
    dim("|", color),
    `${dim("Workspace:", color)} ${rgb(props.brand.workspace ?? "~/projects/example", theme.blue, color)}`,
    dim("|", color),
    `${dim("Profile:", color)} ${props.brand.profile ?? "default"}`,
    dim("[?]", color),
  ];
  const header = renderBrandHeader({
    title: props.brand.title,
    subtitle: props.brand.subtitle,
    mark: props.brand.mark,
    status,
    width,
    color,
  });
  const metricCount = summaryCardColumns(width);
  const headerLines = header.split("\n").length;
  const footerHeight = 3;
  const minMainHeight = width >= 98 ? 10 : 8;
  const projectedMetricLines = Math.ceil(props.metrics.length / metricCount) * 6;
  const showMetrics = height - headerLines - footerHeight - projectedMetricLines >= minMainHeight && !(metricCount === 1 && height < 50);
  const metrics = showMetrics ? renderSummaryCards(props.metrics, width, color) : "";
  const metricLines = metrics ? metrics.split("\n").length : 0;
  const heightAfterRequiredPanels = height - headerLines - metricLines - footerHeight;
  const fileHeight = heightAfterRequiredPanels >= minMainHeight + 9 ? 9 : heightAfterRequiredPanels >= minMainHeight + 7 ? 7 : 0;
  const mainHeight = Math.max(minMainHeight, height - headerLines - metricLines - fileHeight - footerHeight);
  const main = renderMain(props, width, mainHeight, color);
  const fileWatcher = fileHeight
    ? renderFileWatcherPanel({
        rows: props.files,
        watching: "~/projects/example",
        width,
        height: fileHeight,
        active: props.state?.activePanel === "fileWatcher",
        color,
      })
    : "";
  const footer = renderFooter({ ...props.footer, width, color });

  return normalizeFrame([header, metrics, main, fileWatcher, footer].filter(Boolean).join("\n"), width, height);
}
