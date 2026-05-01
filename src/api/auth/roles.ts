import type { Role } from "./types";

const roleRank: Record<Role, number> = {
  customer: 1,
  staff: 2,
  admin: 3,
};

export function hasRole(userRole: Role, required: Role | Role[]): boolean {
  if (Array.isArray(required)) {
    return required.some((role) => roleRank[userRole] >= roleRank[role]);
  }

  return roleRank[userRole] >= roleRank[required];
}
