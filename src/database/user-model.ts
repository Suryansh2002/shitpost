import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    username: String,
    password: String,
    banned: {type:Boolean, default:false},
});

const userModel = mongoose.model("User", userSchema);
export default userModel;