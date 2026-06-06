import type { DonutSegment } from "@prettui/core";
import {
  renderBrandHeader,
  renderDonutSummaryPanel,
  renderFooter,
  renderSparkSectionsPanel,
  renderStatusStrip,
  renderTextPanel,
  renderTimelinePanel,
  type FooterItem,
  type KeyValueRow,
  type StatusStripCell,
  type TimelinePanelRow,
} from "@prettui/components";
import { hstack, normalizeFrame, splitRatioWidths } from "@prettui/core";

export type PermissionWorkflowLayoutProps = {
  width: number;
  height: number;
  color?: boolean;
  brand: { title: string; subtitle: string };
  header: StatusStripCell[];
  events: TimelinePanelRow[];
  tools: TimelinePanelRow[];
  fileActivity: { total: string; segments: DonutSegment[]; files: KeyValueRow[] };
  approvals: string[];
  eventDetail: string[];
  risks: Array<{ label: string; value: string; detail: string; tone: "green" | "amber" | "red" | "cyan"; values: number[] }>;
  footer: { status: FooterItem[]; controls: string[] };
  selectedIndex?: number;
};

export function renderPermissionWorkflowLayout(props: PermissionWorkflowLayoutProps): string {
  const width = Math.max(56, Math.floor(props.width));
  const height = Math.max(18, Math.floor(props.height));
  const color = props.color ?? true;
  const brand =
    width >= 128
      ? hstack(
          [
            renderBrandHeader({ ...props.brand, width: Math.min(38, Math.max(30, Math.floor(width * 0.24))), color }),
            renderStatusStrip({
              cells: props.header,
              width: width - Math.min(38, Math.max(30, Math.floor(width * 0.24))) - 1,
              height: 7,
              color,
            }),
          ],
          1
        )
      : renderBrandHeader({ ...props.brand, width, color });
  const headerHeight = brand.split("\n").length;
  const footerHeight = 3;
  const riskHeight = height >= 32 ? 6 : 0;
  const available = Math.max(8, height - headerHeight - footerHeight - riskHeight);
  const mainHeight = Math.max(8, Math.floor(available * 0.58));
  const approvalHeight = Math.max(6, available - mainHeight);
  const blocks = [brand];

  if (width >= 132) {
    const mainWidths = splitRatioWidths(width, [34, 42, 26], 1, [36, 44, 28]);
    blocks.push(
      hstack(
        [
          renderTimelinePanel({
            title: "Event Stream",
            rows: props.events,
            width: mainWidths[0] ?? 36,
            height: mainHeight,
            color,
            selectedIndex: props.selectedIndex,
            active: true,
          }),
          renderTimelinePanel({ title: "Tool Lifecycle", rows: props.tools, width: mainWidths[1] ?? 44, height: mainHeight, color }),
          renderDonutSummaryPanel({
            title: "File Activity",
            totalLabel: props.fileActivity.total,
            subLabel: "Total",
            segments: props.fileActivity.segments,
            width: mainWidths[2] ?? 28,
            height: mainHeight,
            color,
          }),
        ],
        1
      )
    );
    const lowerWidths = splitRatioWidths(width, [58, 42], 1, [58, 42]);
    blocks.push(
      hstack(
        [
          renderTextPanel({
            title: "Approvals & Permissions",
            lines: props.approvals,
            width: lowerWidths[0] ?? 58,
            height: approvalHeight,
            color,
          }),
          renderTextPanel({ title: "Event Detail", lines: props.eventDetail, width: lowerWidths[1] ?? 42, height: approvalHeight, color }),
        ],
        1
      )
    );
  } else {
    blocks.push(
      renderTimelinePanel({
        title: "Event Stream",
        rows: props.events,
        width,
        height: mainHeight,
        color,
        selectedIndex: props.selectedIndex,
        active: true,
      })
    );
    blocks.push(renderTimelinePanel({ title: "Tool Lifecycle", rows: props.tools, width, height: approvalHeight, color }));
  }

  if (riskHeight > 0)
    blocks.push(renderSparkSectionsPanel({ title: "Risk Overview", sections: props.risks, width, height: riskHeight, color }));
  blocks.push(renderFooter({ ...props.footer, width, color }));
  return normalizeFrame(blocks.join("\n"), width, height);
}
