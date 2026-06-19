import { axiosClient } from "./axiosClient";
import type { UserCreateDto, UserDto, UserUpdateDto } from "../types/user";

export const usersApi = {
  async getUsers(): Promise<UserDto[]> {
    const response = await axiosClient.get<UserDto[]>("/api/Users/GetUsers");
    return response.data;
  },

  async getUser(id: string): Promise<UserDto> {
    const response = await axiosClient.get<UserDto>(`/api/Users/GetUser/${id}`);
    return response.data;
  },

  async createUser(data: UserCreateDto): Promise<UserDto> {
    const response = await axiosClient.post<UserDto>(
      "/api/Users/CreateUser",
      data,
    );
    return response.data;
  },

  async updateUser(id: string, data: UserUpdateDto): Promise<UserDto> {
    const response = await axiosClient.put<UserDto>(
      `/api/Users/UpdateUser/${id}`,
      data,
    );
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await axiosClient.delete(`/api/Users/DeleteUser/${id}`);
  },
};
