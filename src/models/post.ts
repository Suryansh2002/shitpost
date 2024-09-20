import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const postSchema = new mongoose.Schema({
    title: {type:String, required:true},
    content: {type:String, default:""},
    imageUrl: {type:String, default:""},
    ip: {type:String, required:true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required:true},
    likes: {type:[mongoose.Schema.Types.ObjectId], default:[]},
    dislikes: {type:[mongoose.Schema.Types.ObjectId], default:[]},
    comments: {type:[{userId: String, content: String}], default:[]},
});

postSchema.pre("validate", function(next){
    if (!this.content && !this.imageUrl){
        this.invalidate("content", "Content or ImageUrl is required !");
        this.invalidate("imageUrl", "Description or ImageUrl is required !");
    }
    next();
})

export type PostDocument = InferSchemaType<typeof postSchema> & {_id: mongoose.Types.ObjectId};
export const postModel = mongoose.model<PostDocument>("Post", postSchema);

export const findWithoutDuplicates = async (ids: string[]):Promise<PostDocument[]> => {
    const mongooseIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    return await postModel.aggregate([
      { $match: { _id: { $nin: mongooseIds } } },
      { $sample: { size: 20 } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]);
}