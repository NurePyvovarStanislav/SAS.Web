import type { AlertLevel } from "./alert";
import type { SensorType } from "./sensor";
import type { UserRole } from "./user";

export interface ImportResultDto {
  created: number;
  updated: number;
  skipped: number;
  warnings: string[];
}

export interface UserBackupDto {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  fieldId: string | null;
  isActive: boolean;
}

export interface FieldBackupDto {
  fieldId: string;
  name: string;
  cropType: string;
  area: number;
  location: string | null;
}

export interface SensorBackupDto {
  sensorId: string;
  name: string;
  sensorType: SensorType;
  minValue: number;
  maxValue: number;
  status: string;
  installedAt: string;
  fieldId: string;
}

export interface MeasurementBackupDto {
  measurementId: string;
  sensorId: string;
  value: number;
  measuredAt: string;
}

export interface AlertBackupDto {
  alertId: string;
  measurementId: string;
  level: AlertLevel;
  message: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt: string | null;
}

export interface AdministrationSnapshotDto {
  schemaVersion: string;
  createdAtUtc: string;
  users: UserBackupDto[];
  fields: FieldBackupDto[];
  sensors: SensorBackupDto[];
  measurements: MeasurementBackupDto[];
  alerts: AlertBackupDto[];
  settings: Record<string, string>;
}

export type ExportEntity =
  | "all"
  | "users"
  | "fields"
  | "sensors"
  | "measurements"
  | "alerts";

export type ExportFormat = "json" | "csv";
