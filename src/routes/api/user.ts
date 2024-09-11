import express from "express";
import { redirectIfAuthenticated } from "../../middlewares/auth";

const router = express.Router();

router.post("/register", redirectIfAuthenticated, (req, res) => {
  res.send("Hello, World!");
});

router.post("/login", redirectIfAuthenticated,(req, res) => {
  res.send("Hello, World!");
});


export { router as userApiRouter };