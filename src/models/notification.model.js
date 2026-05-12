import mongoose , {Schema} from "mongoose";


const notificationSchema = new Schema(
    {
       clientId:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        ownerId:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        notifyType:{
            type: String,
            required: true
        },
        postId:{
            type: mongoose.Types.ObjectId,
            ref:"Video"
        },
        status:{
            type: Boolean,
            default:false,
            required:true
        }
    },
    {timestamps:true}
)


export const Notification = mongoose.model("Notification",notificationSchema)