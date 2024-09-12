import express from "express";
import { redirectIfAuthenticated, redirectIfNotAuthenticated } from "../../middlewares/auth";
import { userModel } from "../../database/user-model";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/register", redirectIfAuthenticated, (req, res) => {
  res.send("Hello, World!");
});

router.post("/login", redirectIfAuthenticated, async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  if (!req.session){
    return res.status(401).send("Session is not available");
  }
  const { username, password }:{username:string, password:string} = req.body;

  const user = await userModel.findOne({username});

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
  req.session = undefined;
  res.clearCookie("session");
  res.json({ message: "Logged out successfully" });
});


export { router as userApiRouter };