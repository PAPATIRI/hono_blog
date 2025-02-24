import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { UserRole } from "../db/schema";

interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// authentication middleware
export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const token = getCookie(c, "auth-token");

  if (!token) return c.redirect("/auth/login");

  try {
    const payload = await verify(
      token,
      process.env.JWT_SECRET || "jwtsecretkeyasoy"
    );
    c.set("user", payload);
    await next();
  } catch (error) {
    console.error("auth error", error);
    setCookie(c, "auth-token", "", { expires: new Date(0) });
    return c.redirect("/auth/login");
  }
};

// role based middleware
export const roleMiddleware = (allowedRoles: string[]) => {
  return async (c: Context, next: () => Promise<void>) => {
    const user = c.get("user") as JWTPayload | undefined;

    if (!user) return c.redirect("/auth/login");

    if (!allowedRoles.includes(user.role)) {
      return c.text("Unauthorized", 403);
    }

    await next();
  };
};

// middleware shortcut for different roles
export const adminOnly = roleMiddleware([UserRole.ADMIN]);
export const writerOnly = roleMiddleware([UserRole.ADMIN, UserRole.WRITER]);
export const authenticated = authMiddleware;
