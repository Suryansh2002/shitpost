import type { Request, Response, NextFunction } from "express";

export function checkPostCooldown(req:Request, res:Response, next:NextFunction){
    if (!req.session?.user){
        return next();
    }
    const lastUploaded = req.session.lastUploaded;
    
    const diff = new Date().getTime() - lastUploaded.getTime();
    if (diff < 3*60*1000){
        return res.status(429).json({message: "You are uploading too fast"});
    }
    req.session
    next();
}