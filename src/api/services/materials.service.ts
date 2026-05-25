import { get, post, patch, del } from "./apiClient";
import type { Material } from "@/api/models";

export function getMaterials(init?: RequestInit) {
  return get<Material[]>("/materials", init);
}

export function getMaterialById(id: string, init?: RequestInit) {
  return get<Material>(`/materials/${id}`, init);
}

export function createMaterial(data: Partial<Material>, init?: RequestInit) {
  return post<Material>("/materials", data, init);
}

export function updateMaterial(id: string, data: Partial<Material>, init?: RequestInit) {
  return patch<Material>(`/materials/${id}`, data, init);
}

export function deleteMaterial(id: string, init?: RequestInit) {
  return del<Material>(`/materials/${id}`, init);
}
