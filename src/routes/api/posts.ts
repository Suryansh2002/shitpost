import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { promises as fs } from "fs";
import { postModel } from "../../models/post";
import { redirectIfNotAuthenticated } from "../../middlewares/auth";
import { checkPostCooldown } from "../../middlewares/post";

const router = express.Router();

const storage = multer.memoryStorage();

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

async function uploadFile(file: Express.Multer.File){
    const hash = crypto.createHash("sha1");
    hash.update(file.buffer);
    const filename = hash.digest("hex") + path.extname(file.originalname);
    try {
        await fs.access(path.join(__dirname, "../../public/uploads"));
    }
    catch (e){
        await fs.mkdir(path.join(__dirname, "../../public/uploads"));
    }
    const filepath = path.join(__dirname, "../../public/uploads", filename);
    await fs.writeFile(filepath, file.buffer);
    return filename;
}


router.post("/create", redirectIfNotAuthenticated, checkPostCooldown ,upload.single("image"), async(req, res) => {
    if (!req.session?.user){
        return res.status(401).json({message: "Unauthorized"});
    }
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const { title, description } = req.body;

    if (!(description || req.file)){
        return res.errorToast("Atleast Description or Image is required")
    }

    let fileName;
    if (req.file){
        fileName = await uploadFile(req.file);
    } else {
        fileName = '';
    }
    const imageUrl = fileName ? '/uploads/' + fileName : '';

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
    res.render("components/posts/post-actions", { post,user:req.session.user});
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
    res.render("components/posts/post-actions", { post,user:req.session.user});
});

router.post("/comment", async(req, res) => {
    if (!req.session?.user){
        res.set("HX-Reswap", "none");
        return res.errorToast("You need to be logged in to comment on a post");
    }
    const content = req.body.content?.trim();
    const post = await postModel.findById(req.body.postId);
    const user = req.session.user;
    if (!post){
        res.set("HX-Reswap", "none");
        return res.errorToast("Post not found");
    }
    if (content.length<1){
        res.set("HX-Reswap", "none");
        return res.errorToast("Comment cannot be empty");
    }
    post.comments.push({content: req.body.content, user: user._id});
    await post.save();
    res.render("components/posts/single-comment", { comment: {content: req.body.content, user: user}});
});

router.delete("/delete", redirectIfNotAuthenticated, async (req, res) => {
    const post = await postModel.findById(req.query.postId);
    if (!post){
        res.set("hx-Reswap", "none");
        return res.errorToast("Post not found");
    }
    if (!req.session?.user){
        res.set("hx-Reswap", "none");
        return res.errorToast("You need to be logged in to delete a post");
    }
    if (post.user.toString() !== req.session.user._id.toString()){
        res.set("hx-Reswap", "none");
        return res.errorToast("You can only delete your own posts");
    }
    await postModel.findByIdAndDelete(req.query.postId);
    if (post.imageUrl){
        await fs.unlink(path.join(__dirname, "../../public", post.imageUrl));
    }
    res.successToast("Post deleted successfully");
});

export { router as postsApiRouter };