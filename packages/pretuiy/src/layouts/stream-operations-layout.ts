import type { DonutSegment } from "../charts";
import {
  renderBrandHeader,
  renderDonutSummaryPanel,
  renderFooter,
  renderHeatmapPanel,
  renderKeyValuePanel,
  renderSparkSectionsPanel,
  renderStatusStrip,
  renderTextPanel,
  renderTimelinePanel,
  type FooterItem,
  type HeatmapRow,
  type KeyValueRow,
  type StatusStripCell,
  type TimelinePanelRow,
} from "../components";
import { hstack, normalizeFrame, splitRatioWidths } from "../layout";

export type StreamOperationsLayoutProps = {
  width: number;
  height: number;
  color?: boolean;
  brand: { title: string; subtitle: string; workspace: string; branch: string };
  status: StatusStripCell[];
  waterfall: TimelinePanelRow[];
  matrix: TimelinePanelRow[];
  approvalCards: string[];
  approvalStats: { total: string; segments: DonutSegment[] };
  heatmap: HeatmapRow[];
  files: KeyValueRow[];
  services: KeyValueRow[];
  resources: Array<{ label: string; value: string; detail: string; tone: "green" | "amber" | "red" | "cyan"; values: number[] }>;
  footer: { status: FooterItem[]; controls: string[] };
  selectedIndex?: number;
};

export function renderStreamOperationsLayout(props: StreamOperationsLayoutProps): string {
  const width = Math.max(56, Math.floor(props.width));
  const height = Math.max(18, Math.floor(props.height));
  const color = props.color ?? true;
  const brand = renderBrandHeader({
    title: props.brand.title,
    subtitle: props.brand.subtitle,
    status: [`Workspace: ${props.brand.workspace}`, `Branch: ${props.brand.branch}`],
    width,
    color,
  });
  const headerHeight = brand.split("\n").length;
  const footerHeight = 3;
  const statusHeight = width >= 128 && height >= 36 ? 7 : 0;
  const available = Math.max(8, height - headerHeight - statusHeight - footerHeight);
  const mainHeight = Math.max(8, Math.floor(available * 0.42));
  const approvalsHeight = width >= 120 && available >= 24 ? 8 : 0;
  const lowerHeight = Math.max(6, available - mainHeight - approvalsHeight);
  const blocks = [brand];

  if (statusHeight > 0) blocks.push(renderStatusStrip({ cells: props.status, width, height: statusHeight, color }));

  if (width >= 120) {
    const widths = splitRatioWidths(width, [50, 50], 1, [54, 54]);
    blocks.push(
      hstack(
        [
          renderTimelinePanel({
            title: "Hook Event Waterfall / Timeline",
            rows: props.waterfall,
            width: widths[0] ?? 54,
            height: mainHeight,
            color,
            waterfall: true,
            selectedIndex: props.selectedIndex,
          }),
          renderTimelinePanel({
            title: "Command & Tool Execution Matrix",
            rows: props.matrix,
            width: widths[1] ?? 54,
            height: mainHeight,
            color,
          }),
        ],
        1
      )
    );
  } else {
    blocks.push(
      renderTimelinePanel({
        title: "Hook Event Waterfall / Timeline",
        rows: props.waterfall,
        width,
        height: mainHeight,
        color,
        waterfall: true,
        selectedIndex: props.selectedIndex,
      })
    );
  }

  if (approvalsHeight > 0) {
    const widths = splitRatioWidths(width, [68, 32], 1, [64, 30]);
    blocks.push(
      hstack(
        [
          renderTextPanel({
            title: "Permissions & Approvals Lane",
            lines: props.approvalCards,
            width: widths[0] ?? 64,
            height: approvalsHeight,
            color,
          }),
          renderDonutSummaryPanel({
            title: "Approval Stats (24h)",
            totalLabel: props.approvalStats.total,
            segments: props.approvalStats.segments,
            width: widths[1] ?? 30,
            height: approvalsHeight,
            color,
          }),
        ],
        1
      )
    );
  }

  if (width >= 120) {
    const widths = splitRatioWidths(width, [54, 46], 1, [50, 42]);
    blocks.push(
      hstack(
        [
          hstack(
            [
              renderHeatmapPanel({
                title: "File Change Heatmap",
                rows: props.heatmap,
                width: Math.floor((widths[0] ?? 50) * 0.45),
                height: lowerHeight,
                color,
              }),
              renderKeyValuePanel({
                title: "Last Changed Files",
                rows: props.files,
                width: (widths[0] ?? 50) - Math.floor((widths[0] ?? 50) * 0.45) - 1,
                height: lowerHeight,
                color,
              }),
            ],
            1
          ),
          hstack(
            [
              renderKeyValuePanel({
                title: "System Health & Status",
                rows: props.services,
                width: Math.floor((widths[1] ?? 42) * 0.52),
                height: lowerHeight,
                color,
              }),
              renderSparkSectionsPanel({
                title: "Resource Usage",
                sections: props.resources,
                width: (widths[1] ?? 42) - Math.floor((widths[1] ?? 42) * 0.52) - 1,
                height: lowerHeight,
                color,
              }),
            ],
            1
          ),
        ],
        1
      )
    );
  } else {
    blocks.push(renderHeatmapPanel({ title: "File Change Heatmap", rows: props.heatmap, width, height: lowerHeight, color }));
  }

  blocks.push(renderFooter({ ...props.footer, width, color }));
  return normalizeFrame(blocks.join("\n"), width, height);
}
