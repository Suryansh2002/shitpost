import type { Request, Response, NextFunction } from "express";
import { Session } from "../lib/session";

export async function injectSession(req: Request, res: Response, next: NextFunction) {
  if (req.url.startsWith("/uploads")){
    return next();
  }
  const encodedSession = req.cookies?.session;
  if (encodedSession) {
    req.session = await Session.fromCookie(encodedSession);
  } else {
    req.session = new Session();
  }
  Session.injectPersistence(req, res);
  next();
}

export function redirectIfAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session?.isAuthenticated) {
    return res.htmxRedirect("/");
  }
  next();
}

export function redirectIfNotAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session || !req.session.isAuthenticated) {
    return res.htmxRedirect("/login");
  }
  next();
}
