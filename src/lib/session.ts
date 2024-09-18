import type { Request, Response } from "express";
import { userModel, type UserDocument } from "../models/user";
import { generateToken, decodeToken } from "./jwt";

export class Session {
  user?: UserDocument | null;
  token?: string;
  exp: Date;
  validationUsername?: string;
  private invalidated: boolean = false;

  constructor({
    expiresAt: exp,
    user,
    token,
    validationUsername,
  }: {
    expiresAt?: Date;
    user?: any;
    token?: string;
    validationUsername?: string;
  } = {}) {
    this.user = user;
    this.token = token;
    this.exp = this.getExpiresAt(exp);
    this.validationUsername = validationUsername;
  }

  private getExpiresAt(expiresAt?: Date) {
    if (expiresAt) return expiresAt;
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  }

  get isExpired() {
    return new Date() > this.exp;
  }

  get isInvalidated() {
    return this.invalidated;
  }

  get isAuthenticated() {
    if (this.isInvalidated) return false;
    if (this.isExpired) return false;
    return !!this.user;
  }

  static injectPersistence(req: Request, res: Response) {
    // I am not sure if we should automatically update the session cookie or manually update it,
    // This function currently automatically updates the session cookie on every response.

    // @ts-ignore
    if (res.modified) return;
    if (!req.session) return;

    const originalEnd = res.end.bind(res);
    // @ts-ignore
    res.end = (...rest) => {
      req.session?.update(res);
      // @ts-ignore
      originalEnd(...rest);
    };
    // @ts-ignore
    res.modified = true;
  }

  static async fromCookie(cookie: string) {
    const data = decodeToken(cookie);
    if (!data) return new Session();
    
    if (data.user_id) {
      data.user = await userModel.findById(data.user_id);
      delete data.user_id;
    }

    const date = new Date(data.exp);
    delete data.exp;

    data.exp = date;
    data.token = cookie;

    return new Session(data);
  }

  private update(res: Response) {
    if (this.invalidated) {
      return res.clearCookie("session");
    }
    res.cookie("session", this.toCookie(), {
      expires: this.exp,
      httpOnly: true,
      // sameSite: "strict"
    });
  }

  toCookie() {
    const data = {
      ...this,
    } as { [key: string]: any };
    if (data.user) {
      data.user_id = data.user.id;
      delete data.user;
    }
    delete data.token;
    return generateToken(data);
  }

  refreshExpiry() {
    this.exp = this.getExpiresAt();
  }

  invalidate() {
    this.invalidated = true;
  }
}
