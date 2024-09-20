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
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const { title, description } = req.body;
    const imageName = req.file?.filename;
    const imageUrl = imageName ? '/uploads/' + imageName : '';

    if (!(description || imageName)){
        return res.errorToast("Atleast Description or Image is required")
    }

    await postModel.create({title: title, content: description, ip: ip, user: req.session.user._id, imageUrl: imageUrl});
    req.session.user.lastUploaded = new Date();
    // @ts-ignore
    req.session.user.save();
    res.htmxRedirect("/posts/my-posts");
});

router.post("/like", async(req, res) => {
    if (!req.session?.user){
        res.set("HX-Reswap", "none");
        return res.errorToast("You need to be logged in to like a post");
    }
    const post = await postModel.findById(req.body.postId);
    const user = req.session.user;
    if (!post){
        res.set("HX-Reswap", "none");
        return res.errorToast("Post not found");
    }
    if (post.likes.includes(user._id)){
        post.likes = post.likes.filter((id) => id.toString() !== user._id.toString());
    } else {
        post.likes.push(user._id);
    }
    if (post.dislikes.includes(user._id)){
        post.dislikes = post.dislikes.filter((id) => id.toString() !== user._id.toString());
    }
    await post.save();
    res.render("components/post-actions", { post,user:req.session.user});
});

router.post("/dislike", async(req, res) => {
    if (!req.session?.user){
        res.set("HX-Reswap", "none");
        return res.errorToast("You need to be logged in to dislike a post");
    }
    const post = await postModel.findById(req.body.postId);
    const user = req.session.user;
    if (!post){
        res.set("HX-Reswap", "none");
        return res.errorToast("Post not found");
    }
    if (post.dislikes.includes(user._id)){
        post.dislikes = post.dislikes.filter((id) => id.toString() !== user._id.toString());
    } else {
        post.dislikes.push(user._id);
    }
    if (post.likes.includes(user._id)){
        post.likes = post.likes.filter((id) => id.toString() !== user._id.toString());
    }
    await post.save();
    res.render("components/post-actions", { post,user:req.session.user});
});

export { router as postsApiRouter };