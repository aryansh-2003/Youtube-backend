import {ApiError} from "../utils/ApiError.js"
import {Notification} from '../models/notification.model.js'
import mongoose from "mongoose"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const getNotifications = asyncHandler(async (req,res) => {
    const userId = req.user._id
    console.log(userId)

    if(!userId){
        throw new ApiError(404, "User not exist")
    }

    const notifications = await Notification.aggregate([
        {
            $match: { ownerId:userId }
        },
        { 
            $lookup:{
                from: "users",
                localField: "clientId",
                foreignField:"_id",
                as:"clientInfo",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            _id:1,
                            avatar:1,
                            username:1
                        }
                    }
                ]
            }
        },
        { 
            $lookup:{
                from: "videos",
                localField: "postId",
                foreignField:"_id",
                as:"postInfo",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            thumbnail:1
                        }
                    }
                ]
            }
        },   
])
   


    res.status(200).json(new ApiResponse(
        200,
        {notifications:notifications},
        "Notifications Retrieved"
    ))

    // console.log(notifications)

})

// const sendTotalActiveNotification = async(req,res) =>{
//     const response =  Notification.find({

//     })
// }

export {getNotifications}