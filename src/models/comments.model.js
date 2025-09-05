import mongoose,{Schema} from "mongoose";


const commentSchema = new Schema(
    {
        content:{
            type: String,
            required: true
        },
        vide:{
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps:true}
)


export const Comment = mongoose.model("Comment",commentSchema)