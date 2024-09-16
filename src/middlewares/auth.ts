import type { Request, Response, NextFunction } from "express";
import { Session } from "../lib/session";

export async function injectSession(req: Request, res: Response, next: NextFunction) {
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
  // if (req.session?.isAuthenticated) {
  //   return res.set("hx-redirect", "/").status(301).json({ message: "Unauthorized" });
  // }
  next();
}

export function redirectIfNotAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // if (!req.session || !req.session.isAuthenticated) {
  //   return res.set("hx-redirect", "/login").status(301).json({ message: "Unauthorized" });
  // }
  next();
}
