import { box, type BoxOptions } from "@prettui/core";

export type PanelProps = BoxOptions & {
  title?: string;
  children: string | string[];
};

export function renderPanel({ title = "", children, ...options }: PanelProps): string {
  return box(title, children, options);
}
