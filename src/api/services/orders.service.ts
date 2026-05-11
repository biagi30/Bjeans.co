import { get } from "./apiClient";
import type { Order } from "@/api/models";

export function getOrders(init?: RequestInit) {
  return get<Order[]>("/orders", init);
}

export function getOrderById(id: string, init?: RequestInit) {
  return get<Order>(`/orders/${id}`, init);
}

export function getSplitOrders(parentId: string, init?: RequestInit) {
  return get<Order[]>(`/orders/${parentId}/splits`, init);
}
