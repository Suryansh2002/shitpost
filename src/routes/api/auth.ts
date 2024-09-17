import express from "express";
import bcrypt from "bcrypt";
import { userModel } from "../../models/user";
import {
  redirectIfAuthenticated,
  redirectIfNotAuthenticated,
} from "../../middlewares/auth";
import { isValidEmail } from "../../lib/utils";

const router = express.Router();

router.post("/signup", redirectIfAuthenticated, async (req, res) => {
  const { username, password, email } = req.body as {
    username?: string;
    password?: string;
    email?: string;
  };

  if (!username || !password || !email) {
    return res.render("components/toast", {
      message: "Username, email and password are required",
      type: "failed",
    })
  }

  if (!isValidEmail(email)){
    return res.render("components/toast", {
      message: "Invalid email",
      type: "failed",
    })
  }

  const existingUser = await userModel.findOne({ username }) || await userModel.findOne({ email });
  if (existingUser) {
    return res.render("components/toast", {
      message: "Username or Email already taken",
      type: "failed",
    })
  }

  // I will add email validation here later

  const user = await userModel.create({
    username,
    email,
    password,
  });

  if(req.session?.user){
    req.session.user = user;
    req.session.refresh();
  };
  res.set("HX-Redirect", "/posts/new");
  res.render("components/toast", {
    message: "User created successfully",
    type: "success",
  })
});

router.post("/login", redirectIfAuthenticated, async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return res.render("components/toast", {
      message: "Username and password are required",
      type: "failed",
    })
  }

  const user = await userModel.findOne({ username });

  if (!user) {
    return res.render("components/toast", {
      message: "User not found",
      type: "failed",
    }) 
  }

  const isPasswordValid = bcrypt.compare(password, user.password || "");

  if (!isPasswordValid) {
    return res.render("components/toast", {
      message: "Invalid password",
      type: "failed",
    })
  }

  if (req.session) {
    req.session.user = user;
    req.session.refresh();
  }
  res.set("HX-Redirect", "/posts/new");
  res.render("components/toast", {
    message: "Logged in successfully",
    type: "success",
  })
});

router.post("/logout", redirectIfNotAuthenticated, (req, res) => {
  req.session?.invalidate();
  res.htmxRedirect("/");
});

export { router as authApiRouter };