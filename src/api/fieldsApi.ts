import { axiosClient } from "./axiosClient";
import type { FieldDto, FieldFormDto } from "../types/field";

export const fieldsApi = {
  async getFields(): Promise<FieldDto[]> {
    const response = await axiosClient.get<FieldDto[]>("/api/Fields/GetFields");
    return response.data;
  },

  async getField(id: string): Promise<FieldDto> {
    const response = await axiosClient.get<FieldDto>(
      `/api/Fields/GetField/${id}`,
    );
    return response.data;
  },

  async createField(data: FieldFormDto): Promise<FieldDto> {
    const response = await axiosClient.post<FieldDto>(
      "/api/Fields/CreateField",
      data,
    );
    return response.data;
  },

  async updateField(id: string, data: FieldFormDto): Promise<FieldDto> {
    const response = await axiosClient.put<FieldDto>(
      `/api/Fields/UpdateField/${id}`,
      data,
    );
    return response.data;
  },

  async deleteField(id: string): Promise<void> {
    await axiosClient.delete(`/api/Fields/DeleteField/${id}`);
  },
};
