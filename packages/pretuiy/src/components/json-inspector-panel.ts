import { dim, fitAnsi, joinAligned, rgb, theme, truncate } from "../ansi";
import { segmentedDonut, type DonutSegment } from "../charts";
import { hstack } from "../layout";
import { renderPanel } from "./panel";

function colorJsonLine(line: string, color: boolean): string {
  if (!color) return line;
  return line
    .replace(/^(\s*)"([^"]+)":/u, (_match, space: string, key: string) => `${space}${rgb(`"${key}"`, theme.cyan, color)}:`)
    .replace(
      /: "([^"]*)"/gu,
      (_match, value: string) => `: ${rgb(`"${value}"`, value.startsWith("/") || value.includes(".") ? theme.lime : theme.amber, color)}`
    )
    .replace(/: (\d+)/gu, (_match, value: string) => `: ${rgb(value, theme.amber, color)}`);
}

export function renderJsonInspectorPanel(props: {
  title: string;
  id: string;
  value: unknown;
  width: number;
  height: number;
  riskMix?: { total: string; subLabel: string; segments: DonutSegment[]; legend: string[] };
  active?: boolean;
  color?: boolean;
}): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const title = joinAligned(
    rgb(props.title, theme.green, color),
    `${dim("ID:", color)} ${truncate(props.id, Math.max(10, inner - 5))}`,
    inner
  );
  const json = JSON.stringify(props.value, null, 2)
    .split("\n")
    .map((line) => fitAnsi(colorJsonLine(line, color), inner));
  const lines = [title, ...json.slice(0, Math.max(4, props.height - 17)), dim("... truncated", color)];

  if (props.riskMix && inner >= 42 && props.height >= 22) {
    while (lines.length < props.height - 11) lines.push("");
    const total = props.riskMix.segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
    const legend = props.riskMix.segments.map((segment, index) => {
      const fallback = `${segment.label.padEnd(8)} ${String(segment.value).padStart(4)} ${`${Math.round((segment.value / total) * 100)}%`.padStart(4)}`;
      const provided = props.riskMix?.legend[index]?.replace(/^■\s*/u, "") ?? fallback;
      return `${rgb("■", segment.color, color)} ${provided}`;
    });
    const donut = segmentedDonut(props.riskMix.segments, {
      width: 14,
      height: 6,
      centerLabel: props.riskMix.total,
      centerSubLabel: props.riskMix.subLabel,
      color,
    }).join("\n");
    lines.push(rgb("RISK MIX", theme.green, color), ...hstack([donut, legend.join("\n")], 2).split("\n"));
  }

  return renderPanel({
    children: lines,
    width: props.width,
    height: props.height,
    color,
    paddingX: 1,
    accent: props.active ? theme.cyan : undefined,
  });
}
