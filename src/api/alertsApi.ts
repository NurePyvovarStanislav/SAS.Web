import { axiosClient } from "./axiosClient";
import type { AlertDto, AlertResolveDto } from "../types/alert";

export const alertsApi = {
  async getAlerts(fieldId: string): Promise<AlertDto[]> {
    const response = await axiosClient.get<AlertDto[]>("/api/Alerts/GetAlerts", {
      params: { fieldId },
    });
    return response.data;
  },

  async getAlert(id: string): Promise<AlertDto> {
    const response = await axiosClient.get<AlertDto>(`/api/Alerts/GetAlert/${id}`);
    return response.data;
  },

  async resolveAlert(id: string, data: AlertResolveDto): Promise<void> {
    await axiosClient.post(`/api/Alerts/ResolveAlert/${id}`, data);
  },

  async deleteAlert(id: string): Promise<void> {
    await axiosClient.delete(`/api/Alerts/DeleteAlert/${id}`);
  },
};
