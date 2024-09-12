import type { Request, Response } from "express";

export class Session {
  user?: any;
  token?: string;
  readonly expiresAt: Date;
  [key: string]: any;

  constructor({
    expiresAt,
    user,
    token,
    ...rest
  }: {
    expiresAt: Date;
    user?: any;
    token?: string;
    [key: string]: any;
  }) {
    this.user = user;
    this.token = token;
    this.expiresAt = expiresAt;
    Object.assign(this, rest);
  }

  get isExpired() {
    return this.expiresAt ? this.expiresAt.getTime() < Date.now() : true;
  }

  get isAuthenticated() {
    return !!this.user;
  }

  static injectPersistence(req: Request, res: Response) {
    // @ts-ignore
    if (res.modified) return;
    if (!req.session) return;

    // @ts-ignore
    const originalEnd = res.end.bind(res);
    // @ts-ignore
    res.end = (...rest) => {
      req.session?.updateSession(res);
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
    data.date = date;
    data.token = cookie;

    return new Session(data);
  }

  updateSession(res: Response) {
    res.cookie("session", this.toCookie(), {
      expires: this.expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
}
