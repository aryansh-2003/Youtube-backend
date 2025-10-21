import mongoose,{ObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/likes.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import { Tweet } from "../models/tweets.model.js"
import { Playlist } from "../models/playlist.model.js"



const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
     const userId = req.user._id;

     const totalVideos = await Video.find({owner: userId})
     const totalSubscribers = await Subscription.find({channel:userId})
     const totalTweet = await Tweet.find({owner:userId})
     const totalLikes = await Like.aggregate([
        {
            $match:{
                video:{$in:totalVideos.map((vid) => vid?._id)}
            }
        }
     ])
     const totalVideoViews = totalVideos.reduce((acc,current) => acc + current.views , 0)
     const totalPlaylist = await Playlist.aggregate([
        {
            $match:{owner:userId}
        }
     ])
    
     
    if(!totalTweet || !totalVideos || !totalSubscribers || !totalSubscribers || !totalLikes || !totalVideoViews || !totalPlaylist ) throw new ApiError(500 , "Internal Server Error")

    return res.status(200).json(new ApiResponse(
        200,
        {totalTweet: totalTweet.length,totalVideos : totalVideos.length,totalSubscribers : totalSubscribers.length,totalLikes : totalLikes.length,totalVideoViews : totalVideoViews,totalPlaylist : totalPlaylist.length},
        "User dashboard"
    )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {userId} = req.params 
    // if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid");



    const channelVideos = await Video.aggregate([
        {
            $match:{owner:new mongoose.Types.ObjectId(`${userId}`)}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerInfo",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            avatar:1,
                            username:1
                        }
                    }
                ]
            }
        }
    ])
   
     
    if(channelVideos.length == 0){
        return res.status(200).json(new ApiResponse(
        200,
        [],
        "No videos Available"
     ))
    }

     return res.status(200).json(new ApiResponse(
        200,
        channelVideos,
        "Videos fetched succesfullyy"
     ))
})

export {
    getChannelStats, 
    getChannelVideos
    }
    