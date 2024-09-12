import express from "express";
import { postRouter } from "./posts";
import { apiRouter } from "./api";
import { getPosts } from "../lib/mock-data";
import { injectSession, redirectIfAuthenticated } from "../middlewares/auth";
import { Session } from "../lib/session";

const router = express.Router();
router.use(injectSession);

router.get("/", (req, res) => {
  res.render("home", {posts: JSON.stringify(getPosts().slice(0, 20))});
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
    res.render("partials/signup");
  } else {
    res.render("signup");
  }
});

router.use("/posts", postRouter);
router.use("/api", apiRouter);

export default router;

// Htmx, ejs, express, typescript, bun, s3