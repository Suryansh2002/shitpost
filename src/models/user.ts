import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    username: String,
    password: String,
    banned: {type:Boolean, default:false},
    lastUploaded: {type: Date, default: new Date(0)},
});

export type UserDocument = InferSchemaType<typeof userSchema> & {_id: mongoose.Types.ObjectId};
export const userModel = mongoose.model<UserDocument>("User", userSchema);
