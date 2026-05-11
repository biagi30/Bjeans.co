export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}
