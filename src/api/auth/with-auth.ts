import type { NextRequest } from "next/server";
import { forbiddenResponse, unauthorizedResponse } from "./responses";
import { hasRole } from "./roles";
import { getSessionUser } from "./session";
import type { Role, SessionUser } from "./types";

type RouteHandlerContext = {
  params?: Record<string, string | string[]>;
};

type AuthHandler = (
  req: NextRequest,
  ctx: RouteHandlerContext,
  user: SessionUser
) => Response | Promise<Response>;

type AuthOptions = {
  roles?: Role | Role[];
};

export function withAuth(handler: AuthHandler, options?: AuthOptions) {
  return async (req: NextRequest, ctx: RouteHandlerContext) => {
    const user = await getSessionUser();

    if (!user) {
      return unauthorizedResponse();
    }

    if (options?.roles && !hasRole(user.role, options.roles)) {
      return forbiddenResponse();
    }

    return handler(req, ctx, user);
  };
}
