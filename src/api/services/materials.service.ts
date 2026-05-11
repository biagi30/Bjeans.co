import { get } from "./apiClient";
import type { Material } from "@/api/models";

export function getMaterials(init?: RequestInit) {
  return get<Material[]>("/materials", init);
}

export function getMaterialById(id: string, init?: RequestInit) {
  return get<Material>(`/materials/${id}`, init);
}
