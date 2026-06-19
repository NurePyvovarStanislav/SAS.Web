import type { UserDto } from "./user";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface AuthResponseDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserDto;
}
