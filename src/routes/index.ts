import express from "express";
import { postRouter } from "./posts";
import { apiRouter } from "./api";

import { injectSession, redirectIfAuthenticated } from "../middlewares/auth";
import { injectHtmxRedirect, injectToasts } from "../middlewares/utils";

import { findWithoutDuplicates } from "../models/post";

const router = express.Router();
router.use(injectSession);
router.use(injectHtmxRedirect);
router.use(injectToasts);

router.get("/", async (req, res) => {
  const posts = await findWithoutDuplicates([]);
  res.render("home", {
    posts: posts,
    postIds: JSON.stringify(posts.map((post) => post._id)),
    user: req.session?.user,
  });
});

router.get("/login", redirectIfAuthenticated, (req, res) => {
  if (req.headers["hx-request"]){
    res.render("partials/login");
  } else {
    res.render("login");
  }
});

router.get("/signup", redirectIfAuthenticated, (req, res) => {
  if (req.headers["hx-request"]){
    res.render("components/signup");
  } else {
    res.redirect("/login");
  }
});

router.use("/posts", postRouter);
router.use("/api", apiRouter);

export default router;