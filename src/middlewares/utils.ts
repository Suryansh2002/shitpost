import type { Request, Response, NextFunction } from "express";

export function injectHtmxRedirect(req: Request, res: Response, next: NextFunction) {
    const htmxRedirect = (url:string)=>{
        if(!req.headers["hx-request"]) return res.redirect(url);
        res.set("hx-location", url).status(201).json({ message: "Redirecting" });
    }    
    res.htmxRedirect = htmxRedirect;
    next();
}

export function injectToasts(req: Request, res: Response, next: NextFunction) {
    const errorToast = (message: string) => {
        res.render("components/toast", {
            message,
            type: "failed",
        });
    };
    const successToast = (message: string) => {
        res.render("components/toast", {
            message,
            type: "success",
        });
    };
    res.errorToast = errorToast;
    res.successToast = successToast;
    next();
}