import type { UserRole } from "../types/user";

export function isAdministrator(role: UserRole): boolean {
  return role === 1 || role === "Administrator";
}

export function isRegularUser(role: UserRole): boolean {
  return role === 0 || role === "User";
}
