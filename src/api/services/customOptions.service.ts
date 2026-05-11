import { get } from "./apiClient";
import type { CustomOption } from "@/api/models";

export function getCustomOptions(init?: RequestInit) {
  return get<CustomOption[]>("/custom-options", init);
}

export function getCustomOptionsByType(
  type: CustomOption["type"],
  init?: RequestInit
) {
  // Fetch all, then filter client-side (backend has no query filter yet)
  return getCustomOptions(init).then((res) => ({
    ...res,
    data: res.data.filter((opt) => opt.type === type),
  }));
}
