import express from "express";
import { getPosts } from "../lib/mock-data";

const router = express.Router();

router.get("/", async (req, res) => {
  const postIds = JSON.parse(req.headers.postids as string || "[]") as string[];
  if (!postIds){
    return res.send("No postIds provided").status(400);
  }
  const newPosts = getPosts().filter((post) => !postIds?.includes(post.id)).slice(0,20);
  res.set("postIds", JSON.stringify(newPosts.map((post) => post.id)));
  res.render("components/posts", { posts: newPosts});
});


router.get("/new", async (req, res) => {
  if (req.session){
    res.render("new-post");
  } else {
    res.set("Hx-Push-Url", "/login");
    res.render("login");
  }
});



export { router as postRouter };