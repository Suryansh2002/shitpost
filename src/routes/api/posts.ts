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

const fileFilter = (req: express.Request, file:Express.Multer.File, cb:multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images are allowed"));
    }
};


const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5 }, fileFilter:fileFilter});

router.post("/create", redirectIfNotAuthenticated, checkPostCooldown ,upload.single("image"), async(req, res) => {
    if (!req.session?.user){
        return res.status(401).json({message: "Unauthorized"});
    }
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unkown";
    const { title, description } = req.body;
    const imageName = req.file?.filename;

    await postModel.create({title: title, content: description, ip: ip, user: req.session.user._id, imageUrl: '/uploads/' + imageName});
    res.render("components/toast", {message: "Post created successfully"});
});

export { router as postsApiRouter };