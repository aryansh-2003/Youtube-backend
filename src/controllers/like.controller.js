import mongoose, {isValidObjectId, ObjectId} from "mongoose"
import {Like} from "../models/likes.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"



const likeCreate = async (UserId,typeId,type) =>{
     const response = await Like.create({
        [type] : typeId,
        likedby: UserId
    })
    if(!response) throw new ApiError(500, "Something went wrong")
    return response

}


const likeDelte = async (likeId) =>{
     const response = await Like.findByIdAndDelete(likeId) 
     if(!response) throw new ApiError(500, "Something went wrong")
     return response    
}



const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user._id
    if (!userId || !isValidObjectId(userId)) throw new ApiError(400,"User id is invalid");

    const existingLike = await Like.findOne({
        video: videoId,
        likedby: userId
    })

         

    if (!existingLike){
        
        const result = await likeCreate(userId,videoId,"video")
        
        if (!result) throw new ApiError(500,"Something went wrong");
        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Video liked succesfully"
            )
        )
         
    }else{
       
        const result = await likeDelte(existingLike._id)
        
        if (!result) throw new ApiError(500,"Something went wrong");

          return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Video unliked succesfully"
            )
        )
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id
    if (!userId || !isValidObjectId(userId)) throw new ApiError(400,"User id is invalid");
    
    const existingLike = await Like.findOne({
        comment: commentId,
        likedby: userId
    })

         

    if (!existingLike){
        
        const result = await likeCreate(userId,commentId,"comment")
        
        if (!result) throw new ApiError(500,"Something went wrong");
        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Video liked succesfully"
            )
        )
         
    }else{
       
        const result = await likeDelte(existingLike._id)
        
        if (!result) throw new ApiError(500,"Something went wrong");

          return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Video unliked succesfully"
            )
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    const {tweetId} = req.params
    const userId = req.user._id
    if (!userId || !isValidObjectId(userId)) throw new ApiError(400,"User id is invalid");
    
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedby: userId
    })

         

    if (!existingLike){
        
        const result = await likeCreate(userId,tweetId,"tweet")
        
        if (!result) throw new ApiError(500,"Something went wrong");
        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Tweet liked succesfully"
            )
        )
         
    }else{
       
        const result = await likeDelte(existingLike._id)
        
        if (!result) throw new ApiError(500,"Something went wrong");

          return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Tweet unliked succesfully"
            )
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
     const userId = req.user._id
    if (!userId || !isValidObjectId(userId)) throw new ApiError(400,"User id is invalid");
    const likedVideos = await Like.find(
        {
            likedby:userId,
            video: { $exists: true, $ne: null } 
        }
    )

    const totalVideos = await Video.aggregate([
        {
            $match: {_id : {$in: likedVideos.map((video) => video.video)}}
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $lookup:{
                from:"users",
                localField: "owner",
                foreignField:"_id",
                as:"ownerInfo",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            _id:1,
                            avatar:1
                        }
                    }
                ]
            }
        }
    ])

    likedVideos.map((video)=>{
        console.log(video.video)
    })


    return res.status(200).json(
            new ApiResponse(
                200,
                totalVideos,
                "Liked videos fetched succesfully"
            )
        )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
