import type { Request, Response, NextFunction } from "express";

export function checkPostCooldown(req:Request, res:Response, next:NextFunction){
    if (!req.session?.user){
        return next();
    }
    const lastUploaded = req.session.user.lastUploaded;
    const diff = new Date().getTime() - lastUploaded.getTime();
    if (diff < 3*60*1000){
        return res.status(201).render("components/toast", {
            message: "You can only post once every 3 minutes",
            type: "failed",
        });
    }
    next();
}