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

  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    return res.errorToast("Password must contain at least one alphabet and one number");
  }

  const existingUser = await userModel.findOne({ username }) || await userModel.findOne({ email });
  if (existingUser) {
    return res.errorToast("Username or Email already exists");
  }
  
  if (pendingValidations.has(username)) {
    return res.errorToast("Username temporarily unavailable");
  }

  let otp:number;
  do {
    otp = Math.floor(1000 + Math.random() * 9000);
  } while ([...pendingValidations.values()].some((validation) => validation.otp === otp));

  await transporter.sendMail({
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: "Welcome to Shit Post !",
    text: `Your one time password for signup is ${otp}.\nValid for 3 minutes !`,
  });

  pendingValidations.set(username, {
    otp,
    email,
    username,
    password,
    setAt: new Date(),
  });

  req.session.validationUsername = username;
  res.set("HX-Retarget","#formholder").set("HX-Reswap","outerHTML").render("components/auth/otp-form");
});

router.post("/verify-otp", redirectIfAuthenticated, async (req, res) => {
  clearValidationCache();
  if (!req.session) {
    return res.errorToast("Please enable cookies and try again");
  }
  const myValidation = pendingValidations.get(req.session?.validationUsername || "");
  const otp = Number(["first","second","third","fourth"].map((element)=>req.body[element]).join(""));
  if (!myValidation) {
    return res.errorToast("OTP expired");
  }

  if (myValidation.otp !== otp) {
    return res.errorToast("Invalid OTP");
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

  res.htmxRedirect("/");
});


router.post("/login", redirectIfAuthenticated, async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return res.errorToast("Username and password are required");
  }

  const user = await userModel.findOne({ username });

  if (!user) {
    return res.errorToast("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password || "");
  if (!isPasswordValid) {
    return res.errorToast("Invalid password");
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