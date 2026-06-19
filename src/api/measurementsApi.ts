import { axiosClient } from "./axiosClient";
import type { MeasurementDto, MeasurementUpdateDto } from "../types/measurement";

export interface GetMeasurementsBySensorParams {
  sensorId: string;
  from?: string;
  to?: string;
}

export const measurementsApi = {
  async getById(id: string): Promise<MeasurementDto> {
    const response = await axiosClient.get<MeasurementDto>(
      `/api/Measurements/GetById/${id}`,
    );
    return response.data;
  },

  async getBySensor(
    params: GetMeasurementsBySensorParams,
  ): Promise<MeasurementDto[]> {
    const response = await axiosClient.get<MeasurementDto[]>(
      "/api/Measurements/GetBySensor",
      { params },
    );
    return response.data;
  },

  async updateMeasurement(
    id: string,
    data: MeasurementUpdateDto,
  ): Promise<MeasurementDto> {
    const response = await axiosClient.put<MeasurementDto>(
      `/api/Measurements/UpdateMeasurement/${id}`,
      data,
    );
    return response.data;
  },

  async deleteMeasurement(id: string): Promise<void> {
    await axiosClient.delete(`/api/Measurements/DeleteMeasurement/${id}`);
  },
};
