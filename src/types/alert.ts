export type AlertLevel = 0 | 1 | 2 | "Low" | "High" | "Critical";

export interface AlertDto {
  alertId: string;
  measurementId: string;
  level: AlertLevel;
  message: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt: string | null;
}

export interface AlertResolveDto {
  isResolved: boolean;
}
