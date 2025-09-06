import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = await req.user._id
    const {content} = req.body
    if (!content) throw new ApiError(400,"Content is missing");

    const response = await Tweet.create(
        {
            owner: userId,
            content: content
        }
    )

    if (!response) throw new ApiError(500, "Something wen wrong")
    return res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Tweet created succesfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id
    if (!userId) throw new ApiError(400,"User not available");

    const allTweets = await Tweet.find(
        {owner: userId}
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            allTweets,
            "Tweets retrieved succesfully"
        )
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const userId = req.user._id
    const {tweetId} = req.params
    const {content} = req.body

    if (!tweetId || !content) throw new ApiError(400, "Tweet id or Content not received");

    const tweetOwner = await Tweet.findById(tweetId)

    if (!tweetOwner.owner === userId) throw new ApiError(400, "User not authorize to edit");

    const response = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content: content
            }
        }
    )

    res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Tweet succesfully changed"  
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const userId = req.user._id
    const {tweetId} = req.params


    if(!tweetId) throw new ApiError(400,"Tweet id not received")


    const tweetOwner = await Tweet.findById(tweetId)

    if (!tweetOwner.owner === userId) throw new ApiError(400, "User not authorize to edit");

    const response = await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Tweet deleted succesfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}