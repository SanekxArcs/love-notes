export const DASHBOARD_ACTION_EVENT = "love-notes:request-message";
export const DASHBOARD_STATE_EVENT = "love-notes:dashboard-state";

export type DashboardNavState = {
  remainingTime: string;
  canGetMessage: boolean;
  isLoading: boolean;
};
