import type { Request, Response, NextFunction } from "express";
import { Session } from "../lib/session";

export function injectSession(req: Request, res: Response, next: NextFunction) {
  const encodedSession = req.cookies?.session;
  if (encodedSession) {
    req.session = Session.fromCookie(encodedSession);
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
    return res.redirect("/");
  }
  next();
}

export function redirectIfNotAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect("/login");
  }
  next();
}
