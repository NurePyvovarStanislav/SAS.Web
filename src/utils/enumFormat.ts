import type { TFunction } from "i18next";

import type { AlertLevel } from "../types/alert";
import type { SensorType } from "../types/sensor";
import type { UserRole } from "../types/user";

export type NormalizedUserRole = "User" | "Administrator";

export type NormalizedSensorType =
  | "SoilMoisture"
  | "Temperature"
  | "Ph"
  | "Light"
  | "ElectricalConductivity";

export type NormalizedAlertLevel = "Low" | "High" | "Critical";

export function normalizeUserRole(role: UserRole): NormalizedUserRole {
  if (role === 1 || role === "Administrator") {
    return "Administrator";
  }

  return "User";
}

export function normalizeSensorType(type: SensorType): NormalizedSensorType {
  if (typeof type === "string") {
    return type;
  }

  const map: Record<number, NormalizedSensorType> = {
    0: "SoilMoisture",
    1: "Temperature",
    2: "Ph",
    3: "Light",
    4: "ElectricalConductivity",
  };

  return map[type] ?? "SoilMoisture";
}

export function normalizeAlertLevel(level: AlertLevel): NormalizedAlertLevel {
  if (typeof level === "string") {
    return level;
  }

  const map: Record<number, NormalizedAlertLevel> = {
    0: "Low",
    1: "High",
    2: "Critical",
  };

  return map[level] ?? "Low";
}

export function formatUserRole(role: UserRole, t: TFunction): string {
  return t(`roles.${normalizeUserRole(role)}`);
}

export function formatSensorType(type: SensorType, t: TFunction): string {
  return t(`sensorTypes.${normalizeSensorType(type)}`);
}

export function formatAlertLevel(level: AlertLevel, t: TFunction): string {
  return t(`alertLevels.${normalizeAlertLevel(level)}`);
}

export const SENSOR_TYPE_OPTIONS: NormalizedSensorType[] = [
  "SoilMoisture",
  "Temperature",
  "Ph",
  "Light",
  "ElectricalConductivity",
];

export const USER_ROLE_OPTIONS: NormalizedUserRole[] = [
  "User",
  "Administrator",
];

export const ALERT_LEVEL_OPTIONS: NormalizedAlertLevel[] = [
  "Low",
  "High",
  "Critical",
];
