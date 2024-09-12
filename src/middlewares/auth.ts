import type { Request, Response, NextFunction } from "express";
import { Session } from "../lib/session";
import userModel from "../database/user-model";
import bcrypt from "bcrypt";

export function injectSession(req: Request, res: Response, next: NextFunction) {
  function threeDaysLater() {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  }

  const encodedSession = req.cookies?.session;
  if (encodedSession) {
    req.session = Session.fromCookie(encodedSession);
  } else {
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
  if (req.session) {
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

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    const user = await userModel.findOne({
      username,
    });

    if (!user) {
      return res.status(401).send("Invalid username");
    }

    const isPasswordValid = bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }

    //all valid then
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);
    req.session = new Session({
      user,
      expiresAt,
    });

    req.session.updateSession(res);

    res.json({ message: "Logged in successfully" });
  } catch (err) {
    console.error("Error logging in", err);
    res.status(500).send("Internal server error");
  }
}

export function logout(req: Request, res: Response) {
  req.session = undefined;
  res.clearCookie("session");
  res.json({ message: "Logged out successfully" });
}
