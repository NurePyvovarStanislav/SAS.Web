export type SensorType =
  | 0
  | 1
  | 2
  | 3
  | 4
  | "SoilMoisture"
  | "Temperature"
  | "Ph"
  | "Light"
  | "ElectricalConductivity";

export interface SensorDto {
  sensorId: string;
  name: string;
  sensorType: SensorType;
  minValue: number;
  maxValue: number;
  status: string;
  installedAt: string;
  fieldId: string;
}

export interface SensorFormDto {
  name: string;
  sensorType: SensorType;
  minValue: number;
  maxValue: number;
  status: string;
  installedAt: string;
  fieldId: string;
}
