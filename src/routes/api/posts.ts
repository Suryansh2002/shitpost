import express from "express";
import multer from "multer";
import path from "path";
import { postModel } from "../../models/post";
import { redirectIfNotAuthenticated } from "../../middlewares/auth";
import { checkPostCooldown } from "../../middlewares/post";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+Math.random().toString(36).substring(7)+path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post("/create", redirectIfNotAuthenticated, checkPostCooldown ,upload.single("image"), async(req, res) => {
    if (!req.session?.user){
        return res.status(401).json({message: "Unauthorized"});
    }
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unkown";
    const { title, description } = req.body;
    const imageName = req.file?.filename;

    await postModel.create({title: title, content: description, ip: ip, user: req.session.user.id, imageUrl: '/uploads/' + imageName});
    res.status(201).send();
});

export { router as postsApiRouter };