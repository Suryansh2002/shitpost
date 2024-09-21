import express from "express";
import { findWithoutDuplicates, postModel } from "../models/post";
import { redirectIfNotAuthenticated } from "../middlewares/auth";

const router = express.Router();

router.get("/more", async (req, res) => {
  const stringIds = JSON.parse(req.headers.postids as string || "[]") as string[];
  if (stringIds.length<1){
    res.set("postIds", "[]");
    return res.render("components/posts/posts", { posts: []});
  }
  const posts = await findWithoutDuplicates(stringIds);
  res.set("postIds", JSON.stringify(posts.map((post) => post._id)));
  res.render("components/posts/posts", { posts: posts});
});


router.get("/my-posts", redirectIfNotAuthenticated, async (req, res) => {
  if (!req.session?.user){
    return res.errorToast("You need to be logged in to view your posts");
  }
  const posts = await postModel.find({ user: req.session.user._id });
  for (const post of posts){
    // @ts-ignore
    post.user = req.session.user;
  }
  const data = {
    posts: posts,
    user: req.session.user,
    postIds: JSON.stringify(posts.map((post) => post._id)),
  }
  if (!req.headers["hx-request"]){
    return res.render("my-posts", data);
  }
  res.render("partials/my-posts", data);
});

router.get("/new", redirectIfNotAuthenticated, (req, res) => {
  if (!req.headers["hx-request"]){
    return res.render("new-post");
  }
  return res.render("partials/new-post");
});

router.get("/comments", async(req,res)=>{
  const post = await postModel.findById(req.query.postId);
  if (!post){
    return res.errorToast("Post not found");
  }
  await post.populate("comments.user");
  res.render("components/posts/comments", {post:post});
})


export { router as postRouter };