export type UserRole = 0 | 1 | "User" | "Administrator";

export interface UserDto {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  fieldId: string | null;
  isActive: boolean;
}

export interface UserCreateDto {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  fieldId: string | null;
  isActive: boolean;
}

export interface UserUpdateDto {
  email: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  password: string | null;
  fieldId: string | null;
  isActive: boolean;
}
