export type Role = "admin" | "staff" | "customer";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
};
