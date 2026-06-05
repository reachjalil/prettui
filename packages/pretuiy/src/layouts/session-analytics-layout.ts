import { dim, formatNumber, rgb, theme } from "../ansi";
import type { DonutSegment } from "../charts";
import {
  renderBrandHeader,
  renderDonutSummaryPanel,
  renderFooter,
  renderKeyValuePanel,
  renderLogPanel,
  renderTextPanel,
  renderTimelinePanel,
  type FooterItem,
  type KeyValueRow,
  type TimelinePanelRow,
} from "../components";
import { hstack, normalizeFrame, splitRatioWidths } from "../layout";

export type SessionAnalyticsLayoutProps = {
  width: number;
  height: number;
  color?: boolean;
  brand: {
    title: string;
    subtitle: string;
    version?: string;
    uptime: string;
    eventCount: number;
    workspace?: string;
  };
  summary: KeyValueRow[];
  model: KeyValueRow[];
  repository: KeyValueRow[];
  permission: string[];
  hooks: string[];
  timeline: TimelinePanelRow[];
  prompt: string[];
  lifecycle: { total: string; segments: DonutSegment[] };
  approvals: string[];
  files: TimelinePanelRow[];
  updated: KeyValueRow[];
  risks: TimelinePanelRow[];
  logs: TimelinePanelRow[];
  footer: { status: FooterItem[]; controls: string[] };
  selectedIndex?: number;
};

function renderHeader(props: SessionAnalyticsLayoutProps, width: number, color: boolean): string {
  const status = [
    dim(props.brand.version ?? "v0.1.0", color),
    rgb("● LIVE", theme.green, color),
    dim("|", color),
    `${dim("Events:", color)} ${rgb(formatNumber(props.brand.eventCount), theme.green, color)}`,
    dim("|", color),
    `${dim("Uptime:", color)} ${props.brand.uptime}`,
  ];
  return renderBrandHeader({ title: props.brand.title, subtitle: props.brand.subtitle, status, width, color });
}

export function renderSessionAnalyticsLayout(props: SessionAnalyticsLayoutProps): string {
  const width = Math.max(56, Math.floor(props.width));
  const height = Math.max(18, Math.floor(props.height));
  const color = props.color ?? true;
  const header = renderHeader(props, width, color);
  const headerHeight = header.split("\n").length;
  const footerHeight = 3;
  const available = Math.max(8, height - headerHeight - footerHeight);
  const topHeight = width >= 120 && available >= 32 ? 10 : 0;
  const middleHeight = Math.max(8, Math.floor((available - topHeight) * (width >= 120 ? 0.42 : 0.52)));
  const lowerHeight = width >= 120 && available - topHeight - middleHeight >= 9 ? 8 : 0;
  const logHeight = Math.max(5, available - topHeight - middleHeight - lowerHeight);
  const blocks: string[] = [header];

  if (topHeight > 0) {
    const widths = splitRatioWidths(width, [23, 20, 22, 20, 15], 1, [22, 18, 20, 18, 15]);
    blocks.push(
      hstack(
        [
          renderKeyValuePanel({ title: "Session Summary", rows: props.summary, width: widths[0] ?? 22, height: topHeight, color }),
          renderKeyValuePanel({
            title: "Active Model",
            rows: props.model,
            width: widths[1] ?? 18,
            height: topHeight,
            color,
            tone: "amber",
          }),
          renderKeyValuePanel({ title: "Repository / CWD", rows: props.repository, width: widths[2] ?? 20, height: topHeight, color }),
          renderTextPanel({ title: "Permission Mode", lines: props.permission, width: widths[3] ?? 18, height: topHeight, color }),
          renderTextPanel({ title: "Hooks Loaded", lines: props.hooks, width: widths[4] ?? 15, height: topHeight, color }),
        ],
        1
      )
    );
  }

  if (width >= 120) {
    const widths = splitRatioWidths(width, [50, 26, 24], 1, [48, 24, 24]);
    blocks.push(
      hstack(
        [
          renderTimelinePanel({
            title: "Hook Event Timeline",
            rows: props.timeline,
            width: widths[0] ?? 48,
            height: middleHeight,
            color,
            selectedIndex: props.selectedIndex,
          }),
          renderTextPanel({ title: "User Prompt Stream", lines: props.prompt, width: widths[1] ?? 24, height: middleHeight, color }),
          renderDonutSummaryPanel({
            title: "Tool Lifecycle",
            totalLabel: props.lifecycle.total,
            subLabel: "Total",
            segments: props.lifecycle.segments,
            width: widths[2] ?? 24,
            height: middleHeight,
            color,
          }),
        ],
        1
      )
    );
  } else {
    blocks.push(
      renderTimelinePanel({
        title: "Hook Event Timeline",
        rows: props.timeline,
        width,
        height: middleHeight,
        color,
        selectedIndex: props.selectedIndex,
      })
    );
  }

  if (lowerHeight > 0) {
    const widths = splitRatioWidths(width, [38, 24, 18, 20], 1, [34, 22, 16, 18]);
    blocks.push(
      hstack(
        [
          renderTextPanel({
            title: "Approvals Queue",
            lines: props.approvals,
            width: widths[0] ?? 34,
            height: lowerHeight,
            color,
            tone: "red",
          }),
          renderTimelinePanel({ title: "File Changes", rows: props.files, width: widths[1] ?? 22, height: lowerHeight, color }),
          renderKeyValuePanel({ title: "Updated Files", rows: props.updated, width: widths[2] ?? 16, height: lowerHeight, color }),
          renderTimelinePanel({ title: "Risk Alerts", rows: props.risks, width: widths[3] ?? 18, height: lowerHeight, color }),
        ],
        1
      )
    );
  }

  blocks.push(renderLogPanel({ title: "Live Logs", rows: props.logs, width, height: logHeight, color }));
  blocks.push(renderFooter({ ...props.footer, width, color }));
  return normalizeFrame(blocks.join("\n"), width, height);
}
