import express from "express";
import bcrypt from "bcrypt";
import { userModel } from "../../models/user";
import {
  redirectIfAuthenticated,
  redirectIfNotAuthenticated,
} from "../../middlewares/auth";
import { isValidEmail, pendingValidations, clearValidationCache } from "../../lib/validation";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/signup", redirectIfAuthenticated, async (req, res) => {
  clearValidationCache();
  if (!req.session) {
    return res.errorToast("Please enable cookies and try again");
  }

  const { username, password, email } = req.body as {
    username?: string;
    password?: string;
    email?: string;
  };

  if (!username || !password || !email) {
    return res.errorToast("Username, email and password are required");
  }

  if (!isValidEmail(email)){
    return res.errorToast("Invalid email");
  }

  if (username.length < 3 || username.length > 20) {
    return res.errorToast("Username must be between 3 and 20 characters");
  }

  if (password.length < 6 || password.length > 20) {
    return res.errorToast("Password must be between 6 and 20 characters");
  }

  if (!/^[a-zA-Z0-9_]*$/.test(username)) {
    return res.errorToast("Username can only contain letters, numbers and underscores");
  }

  const existingUser = await userModel.findOne({ username }) || await userModel.findOne({ email });
  if (existingUser) {
    return res.errorToast("Username already exists");
  }
  
  if (pendingValidations.has(username)) {
    return res.errorToast("Username temporarily unavailable");
  }

  const otp = Math.floor(1000 + Math.random() * 9000);

  await transporter.sendMail({
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: "Welcome to Shit Post !",
    text: `Your one time password for signup is ${otp}.\nValid for 60 seconds !`,
  });

  pendingValidations.set(username, {
    otp,
    email,
    username,
    password,
    setAt: new Date(),
  });

  req.session.validationUsername = username;
  res.set("HX-Retarget","#formholder").set("HX-Reswap","outerHTML").render("components/otp-form");
});

router.post("/verify-otp", redirectIfAuthenticated, async (req, res) => {
  clearValidationCache();
  if (!req.session) {
    return res.errorToast("Please enable cookies and try again");
  }
  const myValidation = pendingValidations.get(req.session?.validationUsername || "");
  await new Promise(resolve=>setTimeout(resolve,3000));
  const otp = Number(["first","second","third","fourth"].map((element)=>req.body[element]).join(""))
  if (!myValidation) {
    return res.render("components/toast", {
      message: "OTP expired",
      type: "failed",
    })
  }

  if (myValidation.otp !== otp) {
    return res.render("components/toast", {
      message: "Invalid OTP",
      type: "failed",
    })
  }

  const { username, password, email } = myValidation;
  const user = await userModel.create({
    username,
    email,
    password: await bcrypt.hash(password, 10),
  });

  req.session.user = user;
  delete req.session.validationUsername;
  req.session.refreshExpiry();

  res.htmxRedirect("/posts/new");
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
    req.session.refreshExpiry();
  }
  res.htmxRedirect("/posts/new");
});

router.post("/logout", redirectIfNotAuthenticated, (req, res) => {
  req.session?.invalidate();
  res.htmxRedirect("/");
});

export { router as authApiRouter };