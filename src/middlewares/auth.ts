import type { Request, Response, NextFunction } from 'express';
import { Session } from '../lib/session';


export function injectSession(req: Request, res: Response, next: NextFunction) {
  const encodedSession = req.cookies?.session;
  if (encodedSession){
    req.session = Session.fromCookie(encodedSession);
  } else {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);
    req.session = new Session(expiresAt);
  }
  next();
}


export function redirectIfAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session){
    return res.redirect("/");
  }
  next()
}

export function redirectIfNotAuthenticated(req: Request, res: Response, next: NextFunction) {
  
}
