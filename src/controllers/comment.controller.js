import mongoose from "mongoose"
import {Comment} from "../models/comments.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId || !page || !limit) throw new ApiError(404,"videoId, page or limit is missing");


    const comment = await Comment.aggregate([
        {
            $match:{
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort:{createdAt:-1}
        },
          {
            $lookup:{
                from: "users",
                localField:"owner",
                foreignField: "_id",
                as: "ownerInfo",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            subscribersCount: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
    ])

    if (!comment) throw new ApiError(400,"No comments on the video yet");

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comments fetched succesfully"
        )
    )
    
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const userId = req.user._id
    const {content} = req.body

    if (!content) throw new ApiError(400,"Content is missing");


    if (!videoId || !mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400,"Video Id is missing or user is not authorize");

    const response = await Comment.create(
        {
            video:videoId,
            content:content,
            owner:userId
        }
    )


    return res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Comment added"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const userId = req.user._id
    const {content} = req.body

    if (!content) throw new ApiError(400,"Content is missing");

    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400,"user is not authorize");
  
    if (!commentId) throw new ApiError (400, "Comment doesnt exist")

    const response = await Comment.findByIdAndUpdate(commentId,
        {
            content:content
        }
    )

    const newComment = await Comment.findById(commentId)

    res.status(200).json(
        new ApiResponse(
            200,
            newComment,
            "Comment updated"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400,"user is not authorize");
    if (!commentId) throw new ApiError (400, "Comment doesnt exist");
    
    const response = await Comment.findByIdAndDelete(commentId);

    res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Comment deleted"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }