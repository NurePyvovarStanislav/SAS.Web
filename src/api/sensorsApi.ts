import { axiosClient } from "./axiosClient";
import type { SensorDto, SensorFormDto } from "../types/sensor";

export const sensorsApi = {
  async getSensorsByField(fieldId: string): Promise<SensorDto[]> {
    const response = await axiosClient.get<SensorDto[]>(
      `/api/Sensors/GetSensorsByField/${fieldId}`,
    );
    return response.data;
  },

  async createSensor(fieldId: string, data: SensorFormDto): Promise<SensorDto> {
    const response = await axiosClient.post<SensorDto>(
      `/api/Sensors/CreateSensor/${fieldId}`,
      {
        name: data.name,
        sensorType: data.sensorType,
        minValue: data.minValue,
        maxValue: data.maxValue,
        status: data.status,
        installedAt: data.installedAt,
        fieldId,
      },
    );
    return response.data;
  },

  async updateSensor(id: string, data: Omit<SensorFormDto, "fieldId">): Promise<SensorDto> {
    const response = await axiosClient.put<SensorDto>(
      `/api/Sensors/UpdateSensor/${id}`,
      {
        name: data.name,
        sensorType: data.sensorType,
        minValue: data.minValue,
        maxValue: data.maxValue,
        status: data.status,
        installedAt: data.installedAt,
      },
    );
    return response.data;
  },

  async deleteSensor(id: string): Promise<void> {
    await axiosClient.delete(`/api/Sensors/DeleteSensor/${id}`);
  },
};
