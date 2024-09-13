import type { Request, Response } from "express";
import type { UserDocument } from "../models/user";

export class Session {
  user?: UserDocument;
  token?: string;
  expiresAt: Date;
  [key: string]: any;
  private invalidated: boolean = false;

  constructor({
    expiresAt,
    user,
    token,
    ...rest
  }: {
    expiresAt?: Date;
    user?: any;
    token?: string;
    [key: string]: any;
  } = {}) {
    this.user = user;
    this.token = token;
    this.expiresAt = this.getExpiresAt(expiresAt);
    Object.assign(this, rest);
  }

  private getExpiresAt(expiresAt?: Date) {
    if (expiresAt) return expiresAt;
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  }

  get isExpired() {
    return new Date() > this.expiresAt;
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

  static fromCookie(cookie: string) {
    const data = JSON.parse(atob(cookie)); // decode cookie using jwt before
    if (data.user_id) {
      data.user = { id: data.user_id }; // fetch from database
      delete data.user_id;
    }
    const date = new Date(data.expiresAt);
    delete data.expiresAt;
    data.expiresAt = date;
    data.token = cookie;

    return new Session(data);
  }

  private update(res: Response) {
    if (this.invalidated) {
      return res.clearCookie("session");
    }
    res.cookie("session", this.toCookie(), {
      expires: this.expiresAt,
      httpOnly: true,
      sameSite: "strict"
    });
  }

  toCookie() {
    const data = {
      ...this,
    };
    if (data.user) {
      data.user_id = data.user.id;
      delete data.user;
    }
    delete data.token;
    // Tokenify data using jwt before
    return btoa(JSON.stringify(data));
  }

  refresh() {
    this.expiresAt = this.getExpiresAt();
  }

  invalidate() {
    this.invalidated = true;
  }
}
