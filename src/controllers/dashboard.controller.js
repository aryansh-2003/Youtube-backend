import mongoose,{ObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/likes.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import { Tweet } from "../models/tweets.model.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
     const {userId,videoId} = req.params;
     console.log(userId)
    // if (!mongoose.Types.ObjectId.isValid(new mongoose.Types.ObjectId(userId))) throw new ApiError(400, "User id is invalid");

     const userVideos = await Video.find({owner: userId})
     const totalSubscribers = await Subscription.find({channel:userId})
     const totalTweet = await Tweet.find({owner:userId})
    
    
      
     

   //   userVideos.map((video)=>{
   //   const likes = await Like.find({video:video._id}) 

   //   })

  
    
  
   const totalVideoViews = userVideos.reduce((acc, video) => acc + video.views, 0)

   console.log("Total Video Views:" ,totalVideoViews)
   console.log("Total Subscribers:" ,totalSubscribers.length)
   console.log("Total Video:" ,userVideos.length)
   console.log("Total Tweet:" ,totalTweet.length)

 


    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {userId} = req.params 
    // if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid");



    const channelVideos = await Video.find({owner:new mongoose.Types.ObjectId(`${userId}`)})
   
     
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
    