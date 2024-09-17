import type { Request, Response, NextFunction } from "express";

export function injectHtmxRedirect(req: Request, res: Response, next: NextFunction) {
    const htmxRedirect = (url:string)=>{
        if(!req.headers["hx-request"]) return res.redirect(url);
        res.set("hx-redirect", url).status(201).json({ message: "Redirecting" });
    }    
    res.htmxRedirect = htmxRedirect;
    next();
}