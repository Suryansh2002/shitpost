import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: String,
    content: {type:String, default:""},
    imageUrl: {type:String, default:""},
    ip: String,
    likes: {type:Number, default:0},
    dislikes: {type:Number, default:0},
    comments: {type:[{userId: String, content: String}], default:[]},
});

postSchema.pre("validate", function(next){
    if (!this.content && !this.imageUrl){
        this.invalidate("description", "Description or ImageUrl is required !");
        this.invalidate("imageUrl", "Description or ImageUrl is required !");
    }
    next();
})

const postModel = mongoose.model("Post", postSchema);
export default postModel;