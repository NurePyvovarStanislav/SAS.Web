export interface MeasurementDto {
  measurementId: string;
  sensorId: string;
  value: number;
  measuredAt: string;
}

export interface MeasurementUpdateDto {
  value: number;
  measuredAt: string;
}
