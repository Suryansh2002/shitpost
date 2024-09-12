import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";
import type { Document } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    username: String,
    password: String,
    banned: {type:Boolean, default:false},
});

export const userModel = mongoose.model("User", userSchema);
export type UserDocument = Document<unknown,{},InferSchemaType<typeof userSchema>>;