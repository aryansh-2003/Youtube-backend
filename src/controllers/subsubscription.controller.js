import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if (!channelId) throw new ApiError(400, "channel id missing")
    const subscriberId = req.user._id
    if(!mongoose.Types.ObjectId.isValid(subscriberId)) throw new ApiError(400,"Subscriber not authorized");

    if (channelId == subscriberId) throw new ApiError(400,"User can't subscribe it's own channel")
    const isSubscribed = await Subscription.find({
        subscriber:subscriberId,
        channel:channelId
    })


    if (isSubscribed.length === 0) {
        const response = await Subscription.create(
            {
                subscriber:subscriberId,
                channel:channelId
            }
        )
        

        if (!response) throw new ApiError(500, "Something went wrong");

        return res.status(200).json(
            new ApiResponse(
                200,
                response,
                "Channel subscribed"
            )
        )
    }

    const response = await Subscription.findOneAndDelete({
         subscriber:subscriberId,
        channel:channelId
    })

    if (!response) throw new ApiError(500, "Something went wrong");

    return res.status(200).json(
            new ApiResponse(
                200,
                response,
                "Channel Unsubscribed"
            )
    )
    

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) throw new ApiError(400,"Channel id is missing");

    const response  = await Subscription.aggregate(
        [
            {
               $match:{ channel :new mongoose.Types.ObjectId (channelId) }
            },
            {
            $lookup:{
                from:"users",
                localField: "subscriber",
                foreignField:"_id",
                as:"subscriberInfo",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            _id:1,
                            avatar:1
                        }
                    }
                ]
            }
        }
        ]
    )

    if (!response) throw new ApiError(400,"Something went wrong");
    res.status(200).json(
        new ApiResponse(
            200,
            response,
            "All Subscirbers"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const  subscriberId  = req?.user?._id

    if (!subscriberId) throw new ApiError(400,"Channel id is missing");

        const response  = await Subscription.aggregate(
        [
            {
               $match:{ subscriber :new mongoose.Types.ObjectId (subscriberId) }
            },
            {
            $lookup:{
                from:"users",
                localField: "channel",
                foreignField:"_id",
                as:"channelInfo",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            _id:1,
                            avatar:1,
                            coverImage:1
                        }
                    }
                ]
            }
        }
        ]
    )
    
    // const response  = await Subscription.find({
    //     subscriber:subscriberId
    // })

    if (!response) throw new ApiError(400,"Something went wrong");
    res.status(200).json(
        new ApiResponse(
            200,
            response,
            "All Subscribed channels"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}