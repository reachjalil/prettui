import { dim, joinAligned, rgb, theme } from "../ansi";
import { renderPanel } from "./panel";

export type FooterItem = {
  label: string;
  value: string;
  tone?: "green" | "red" | "amber" | "cyan" | "blue" | "purple" | "slate" | "lime" | "white";
};

export function renderFooter(props: { status: FooterItem[]; controls: string[]; width: number; color?: boolean }): string {
  const color = props.color ?? true;
  const inner = Math.max(1, props.width - 4);
  const status = props.status
    .map((item) => `${dim(`${item.label}:`, color)} ${rgb(item.value, theme[item.tone ?? "white"], color)}`)
    .join("     ");
  const controls = props.controls.join("   ");
  return renderPanel({ children: joinAligned(status, controls, inner), width: props.width, height: 3, color, paddingX: 1 });
}
