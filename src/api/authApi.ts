import { axiosClient } from "./axiosClient";
import type {
  AuthResponseDto,
  LoginRequestDto,
  RefreshRequestDto,
} from "../types/auth";

export const authApi = {
  async login(request: LoginRequestDto): Promise<AuthResponseDto> {
    const response = await axiosClient.post<AuthResponseDto>(
      "/api/Auth/Login",
      request,
    );

    return response.data;
  },

  async refresh(request: RefreshRequestDto): Promise<AuthResponseDto> {
    const response = await axiosClient.post<AuthResponseDto>(
      "/api/Auth/Refresh",
      request,
    );

    return response.data;
  },
};
