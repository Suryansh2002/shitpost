import express from "express";
import path from "path";
import router from "./routes";
import connectDb from "./database";
import cookieParser from "cookie-parser";

const app = express();

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(router);

connectDb().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
})