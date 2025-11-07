import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/likes.models.js"

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
    const {userId} = req.params

    if (!userId) throw new ApiError(400,"User not available");

    const allTweets = await Tweet.aggregate([
       {
        $match: {owner: new mongoose.Types.ObjectId(userId)}
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
    ]
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

const homeTweets = asyncHandler(async (req, res) => {
        const {page = 1, limit = 10} = req.query;
        const userId = req?.user?._id

        const totalTweets = await Tweet.countDocuments()

     const Tweets = await Tweet.aggregate([
       
            {
                $sort:({"createdAt":-1})
            },
            {
                $skip: (Number(page) - 1) * Number(limit)
            },
            {
                $limit : Number(limit)
            },
            {
            $lookup: {
                from: "likes",
                let:{tweetId:"$_id",userId:userId},
                pipeline:[
                    {
                        $match:{
                            $expr:{
                                $and:[
                                    {$eq:["$tweet","$$tweetId"]},
                                    {$eq:["$likedby","$$userId"]}
                                ]
                            }
                        }
                    }
                ],
                // localField:"_id",
                // foreignField:"tweet",
                as: "likesInfo"
            }
            },
              {
            $lookup: {
                from: "likes",
                localField:"_id",
                foreignField:"tweet",
                as: "supertotalLikes"
            }
            },
            {
                $addFields:{
                    totalLikes: {$size : "$supertotalLikes"}
                    ,
                    isLiked:{
                        $cond:{
                            if:{$gt:[{$size:"$likesInfo"},0]},
                            then:true,
                            else:false
                        }
                    }
                }
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
            },
            {
                $project:{likesInfo:0 , supertotalLikes:0}
            }
           
        ])


    if (!Tweets) throw new ApiError(400, "Error");

    return res.status(200).json(
        new ApiResponse(
            200,
            {Tweets:Tweets,totalTweets:Math.ceil(totalTweets/10)},
            "Tweet  succesfully"
        )
    )
})

const likedTweets = asyncHandler(async (req, res) => {

    const {page = 1, limit = 10} = req.query;
    const userId = req.user._id

    const allLikedTweets = await Like.find(
        {
            likedby : new mongoose.Types.ObjectId(userId),
        },
        {
            "tweet":1
        }
    )

    const ArrayTweets = allLikedTweets.map((tweet) => tweet.tweet)

    const likedandinfotweet = await Tweet.aggregate([
        {
            $match:{
                "_id": {$in: ArrayTweets}
            }
        },
        
            {
                $sort:({"createdAt":-1})
            },
            {
                $skip: (Number(page) - 1) * Number(limit)
            },
            {
                $limit : Number(limit)
            },
            {
            $lookup: {
                from: "likes",
                let:{tweetId:"$_id",userId:userId},
                pipeline:[
                    {
                        $match:{
                            $expr:{
                                $and:[
                                    {$eq:["$tweet","$$tweetId"]},
                                    {$eq:["$likedby","$$userId"]}
                                ]
                            }
                        }
                    }
                ],
                // localField:"_id",
                // foreignField:"tweet",
                as: "likesInfo"
            }
            },
              {
            $lookup: {
                from: "likes",
                localField:"_id",
                foreignField:"tweet",
                as: "supertotalLikes"
            }
            },
            {
                $addFields:{
                    totalLikes: {$size : "$supertotalLikes"}
                    ,
                    isLiked:{
                        $cond:{
                            if:{$gt:[{$size:"$likesInfo"},0]},
                            then:true,
                            else:false
                        }
                    }
                }
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
            },
            {
                $project:{likesInfo:0 , supertotalLikes:0}
            }
    ])


    if (!likedandinfotweet) throw new ApiError(400, "nOT FOUND");


    res.status(200).json(
        new ApiResponse(
            200,
            likedandinfotweet,
            "Tweet succesfully FETCHED"  
        )
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    homeTweets,
    likedTweets
}