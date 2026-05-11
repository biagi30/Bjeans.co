import { get } from "./apiClient";
import type { Product } from "@/api/models";

export function getProducts(init?: RequestInit) {
  return get<Product[]>("/products", init);
}

export function getProductById(id: string, init?: RequestInit) {
  return get<Product>(`/products/${id}`, init);
}
