import type { Request, Response, NextFunction } from "express";
import { Session } from "../lib/session";

export function injectSession(req: Request, res: Response, next: NextFunction) {
  function threeDaysLater() {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  }

  const encodedSession = req.cookies?.session;
  if (encodedSession) {
    req.session = Session.fromCookie(encodedSession);
  } else if (!req.url.startsWith("/api")) {
    req.session = new Session({ expiresAt: threeDaysLater() });
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
  if (!req.session || req.session.isExpired || !req.session.isAuthenticated) {
    return res.redirect("/login");
  }
  next();
}
