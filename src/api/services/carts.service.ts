import { get, post, patch, del } from "./apiClient";
import type { Cart } from "@/api/models";

export function getCarts(init?: RequestInit) {
  return get<Cart[]>("/carts", init);
}

export function getCartById(id: string, init?: RequestInit) {
  return get<Cart>(`/carts/${id}`, init);
}

export function createCart(body: { user: string }, init?: RequestInit) {
  return post<Cart>("/carts", body, init);
}

export function updateCart(
  id: string,
  body: Partial<Cart>,
  init?: RequestInit
) {
  return patch<Cart>(`/carts/${id}`, body, init);
}

export function deleteCart(id: string, init?: RequestInit) {
  return del<{ message: string }>(`/carts/${id}`, init);
}
