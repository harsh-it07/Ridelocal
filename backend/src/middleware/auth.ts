import { NextFunction, Request, Response } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { AppError } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Verifies the bearer token (or auth cookie) and attaches req.user.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = bearerToken || req.cookies?.token;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired session", 401));
  }
}

// Restricts a route to one or more roles. Must run after requireAuth.
export function requireRole(...roles: Array<"CUSTOMER" | "OWNER" | "ADMIN">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to do this", 403));
    }
    next();
  };
}
