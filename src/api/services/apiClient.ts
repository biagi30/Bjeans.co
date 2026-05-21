const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `API error: ${res.status}`);
  }

  return json as ApiResponse<T>;
}

export function get<T>(endpoint: string, init?: RequestInit) {
  return request<T>(endpoint, { method: "GET", ...init });
}

export function post<T>(endpoint: string, body: unknown, init?: RequestInit) {
  return request<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
  });
}

export function patch<T>(endpoint: string, body: unknown, init?: RequestInit) {
  return request<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...init,
  });
}

export function del<T>(endpoint: string, init?: RequestInit) {
  return request<T>(endpoint, { method: "DELETE", ...init });
}
