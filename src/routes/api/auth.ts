import express from "express";
import bcrypt from "bcrypt";
import { userModel } from "../../models/user";
import {
  redirectIfAuthenticated,
  redirectIfNotAuthenticated,
} from "../../middlewares/auth";

const router = express.Router();

router.post("/register", redirectIfAuthenticated, (req, res) => {
  res.send("Hello, World!");
});

router.post("/login", redirectIfAuthenticated, async (req, res) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  const user = await userModel.findOne({ username });

  if (!user) {
    return res.status(401).send("Invalid username");
  }

  const isPasswordValid = bcrypt.compare(password, user.password || "");

  if (!isPasswordValid) {
    return res.status(401).send("Invalid password");
  }

  if (req.session) {
    req.session.user = user;
    req.session.refresh();
  }
  res.json({ message: "Logged in successfully" });
});

router.post("/logout", redirectIfNotAuthenticated, (req, res) => {
  req.session?.invalidate();
  res.json({ message: "Logged out successfully" });
});

export { router as authApiRouter };