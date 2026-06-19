import type { AxiosResponse } from "axios";

import { axiosClient } from "./axiosClient";
import type {
  ExportEntity,
  ExportFormat,
  ImportResultDto,
} from "../types/administration";
import { downloadFromResponse } from "../utils/fileDownload";

export const administrationApi = {
  async createBackup(): Promise<void> {
    const response = await axiosClient.get<Blob>("/api/Administration/CreateBackup", {
      responseType: "blob",
    });
    downloadFromResponse(response, "sas-backup.json");
  },

  async exportData(format: ExportFormat, entity: ExportEntity): Promise<void> {
    const response = await axiosClient.get<Blob>(
      "/api/Administration/ExportData",
      {
        params: { format, entity },
        responseType: "blob",
      },
    );
    const extension = format === "csv" ? "csv" : "json";
    downloadFromResponse(response, `sas-export-${entity}.${extension}`);
  },

  async importData(file: File): Promise<ImportResultDto> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post<ImportResultDto>(
      "/api/Administration/ImportData",
      formData,
    );

    return response.data;
  },

  async downloadBackupBlob(): Promise<AxiosResponse<Blob>> {
    return axiosClient.get<Blob>("/api/Administration/CreateBackup", {
      responseType: "blob",
    });
  },

  async downloadExportBlob(
    format: ExportFormat,
    entity: ExportEntity,
  ): Promise<AxiosResponse<Blob>> {
    return axiosClient.get<Blob>("/api/Administration/ExportData", {
      params: { format, entity },
      responseType: "blob",
    });
  },
};
