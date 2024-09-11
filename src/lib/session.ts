import type { Request, Response } from "express";

export class Session {
    user?: any;
    token?: string;
    expiresAt: Date;

    constructor(expiresAt: Date, user?: any, token?: string) {
        this.user = user;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    get isExpired() {
        return this.expiresAt ? this.expiresAt.getTime() < Date.now() : true;
    }

    static fromCookie(data:string){
        return Session.fromJSON(atob(data));
    }

    static toCookie(session: Session) {
        return btoa(JSON.stringify(session));
    }

    static fromJSON(data: string) {
        const { user, token, expiresAt } = JSON.parse(data);
        return new Session(new Date(expiresAt), user, token);
    }
}

export function updateSession(req:Request, res: Response){
    if (req.session){
        res.cookie("session", Session.toCookie(req.session), {
            expires: req.session.expiresAt,
            httpOnly: true
        });
    }
}

export type SessionType = typeof Session;
