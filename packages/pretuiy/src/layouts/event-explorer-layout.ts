import { renderTuiDashboard, type TuiDashboardProps } from "../dashboard";

export type EventExplorerLayoutProps = TuiDashboardProps;

export function renderEventExplorerLayout(props: EventExplorerLayoutProps): string {
  return renderTuiDashboard(props);
}
