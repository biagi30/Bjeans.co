import { cookies } from "next/headers";
import type { SessionUser } from "./types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  // TODO: verify token and return decoded user payload.
  return null;
}
