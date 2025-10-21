import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from '../models/video.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from '../models/user.model.js'
import {Like} from '../models/likes.models.js'
import { deleteFromCloudinary, uploadOnCloud } from "../utils/cloudinary.js";




const getAllVideos = asyncHandler(async(req,res)=>{
    const {page = 1, limit = 10, query,sortBy,sortType,userId} = req.query;
    


    if (!query) return new ApiError(500,"Query is empty")

    
    const matchedVideos = await Video.aggregate([
        
        {
            $match:{
                $or: [
                    {title:{ $regex:query, $options: "i"}},
                    {description:{ $regex:query, $options: "i"}}
                ]
            }
        },
        {
            $sort:{
                [sortBy || "title"]: sortType ? Number(sortType) : 1
            }
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit : Number(limit)
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


    if (matchedVideos.length === 0) {
          return res.status(200).json(
        new ApiResponse(
            200,
            [],
            "Not found"
        )
    )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            matchedVideos,
            "Found Videos Succesfully"
        )
    )

})

const getHomeVideos = asyncHandler(async(req,res)=>{
    const {page = 1, limit = 10} = req.query;
    
    
    const matchedVideos = await Video.aggregate([
        {
            $match:{
                isPublished:true
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


    if (matchedVideos.length === 0) {
        return res.status(404).json({ status: "error", message: "No videos found" });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            matchedVideos,
            "Found Videos Succesfully"
        )
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if(!title || !description) throw new ApiError (400,"Title or description is empty!!")

    const userId = req.user._id;

    if(!userId) throw new ApiError(400, "User is not logged in")

    const findUser = await User.findById(userId)


    if (!findUser) throw new ApiError(404,"User doesnt exist")



    const videoLocalPath = await req.files?.video[0].path
    const thumbnailLocalPath = await req.files?.thumbnail[0].path

    console.log(videoLocalPath,thumbnailLocalPath)

    if(!videoLocalPath || !thumbnailLocalPath) throw new ApiError(400,"File is missing")


    const cloudinaryVideo = await uploadOnCloud(videoLocalPath)
    const cloudinaryhumbnail = await uploadOnCloud(thumbnailLocalPath)


    if (!cloudinaryVideo || !cloudinaryhumbnail) throw new ApiError(500,"Cant upload the video or Thumbnail")

    const uploadedVideo = await Video.create({
        videoFile: cloudinaryVideo.url,
        thumbnail:cloudinaryhumbnail.url,
        title,
        description,
        duration:cloudinaryVideo.duration,
        owner:userId
    })


    
    if(!uploadedVideo) throw new ApiError(500,"Uploading video to cloudinary Failed")


    return res.status(200).json(new ApiResponse(200,
        uploadedVideo,
        "Video Uploaded Succesfully"
    ))
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const  {videoId}  = await req.params

    const userId = req.user._id;

    if (!videoId) throw new ApiError(400,"Video id not found")
   
    const video = await Video.findByIdAndUpdate(videoId,
        {$inc: {views: 1}},
        {new:true}
    )

    const removefromHistory = await User.findByIdAndUpdate(userId,{
        $pull:{
            watchHistory: video._id,
        },
        new:true

    })




       const addToHistory = await User.findByIdAndUpdate(userId,{
        $push:{
            watchHistory:{$each:[videoId],$position:0},
        },
    })


    const isLiked = await Like.find(
    {
         video:videoId,
         likedby:userId
    }
   )

//    console.log(isLiked)

   const totalLikes = await Like.find(
    {
        video:videoId
    }
   )


    if (!addToHistory ) throw new ApiError(500, "Something went wrong")

    if(!video) throw new ApiError(404,"Video not found")

    const finalVideo = await Video.aggregate([
        {
            $match: {
                _id: video._id
            }
        },
        {
            $lookup:{
                from: "users",
                localField:"owner",
                foreignField: "_id",
                as: "ownerInfo",
                pipeline:[
                            {
                $lookup: {
                from: "subscriptions", 
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
                }
            },
            {
                $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
                }
            },
            {
                $addFields: {
                subscribersCount: { $size: "$subscribers" },
                channelsSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                    if: {
                        $in: [
                        req.user?._id,
                        { $map: { input: "$subscribers", as: "s", in: "$$s.subscriber" } }
                        ]
                    },
                    then: true,
                    else: false
                    }
                }
                }
            },
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            subscribersCount: 1,
                            avatar: 1,
                            isSubscribed:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                isLiked:{$cond:{if:isLiked.length > 0 ,then: true, else : false}},
                totalLikes:totalLikes?.length
            }
        }
    ])

  
    if (!finalVideo) throw new ApiError(500,"Internal Server Error")
    

    //Todo: return owner info by aggregation piepline


    return res.status(200).json(new ApiResponse(
        200,
        finalVideo,
        "Video found succesfully"
        ))

})

const getsingleVideo = asyncHandler(async(req,res)=>{
     const  {videoId}  = await req.params


    //TODO: get video by id

    if (!videoId) throw new ApiError(400,"Video id not found")
   
    const video = await Video.findById(videoId)


    if(!video) throw new ApiError(404,"Video not found")    

    //Todo: return owner info by aggregation piepline


    return res.status(200).json(new ApiResponse(
        200,
        video,
        "Video found succesfully"
        ))
})

const updateVideo = asyncHandler(async (req, res) => {

  const {title, description,isPublished} = req.body
  const { videoId } = req.params
  const userId = req.user._id
  const thumbnailLocalPath = req.file?.path


  
    const thumbnailCloudinary = await uploadOnCloud(thumbnailLocalPath)
    
    if (!videoId ) return new ApiError(401,"Video id not matched database")

   const video = await Video.findById(videoId)
   

    if(!video) throw new ApiError(400,"Video Not found")

    if(video.owner.toString() != userId.toString()) throw new ApiError(400,"User not authorized to update video")


    if (!title || !description) throw new ApiError(401,"Title or Description is empty!!")

    const UpdatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title:title,
                description:description,
                ...(thumbnailCloudinary && {thumbnail:thumbnailCloudinary.url}),
                ...(isPublished && {isPublished:isPublished})
            }
        },
        {new: true}
    )

    if (!UpdatedVideo) throw new ApiError(500,"Internal server error")
    
    res.status(200).json(new ApiResponse(
        200,
        UpdatedVideo,
        "Video updated succesfully"
        ))
    })

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) throw new ApiError(400, "Video id is missing")


    const videoUrl = await Video.findById(videoId)

    if (!videoUrl) throw new ApiError(404,"Video not found")

    const thumbnailResponse = await deleteFromCloudinary(videoUrl.thumbnail)
    const videoResponse = await deleteFromCloudinary(videoUrl.videoFile)



    if (!thumbnailResponse || !videoResponse) throw new ApiError(400, "Video or Thumbnail doesn't exist in the database!")


    const success = await Video.findByIdAndDelete(videoId)

    //TODO: delete video
    const video = "Viedo"
    return res
    .status(200)
    .json( 
        new ApiResponse(
            200,
            success,
            "Video deleted succesfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {publishStatus} = req.body
    
    if (!videoId) throw new ApiError(404, "Video id is missing")
    if (typeof publishStatus === "undefined") throw new ApiError(404, "Publish status is missing")

    const currStatus = await  Video.findById(videoId)
    if(currStatus.isPublished === publishStatus) throw new ApiError(400,`Status is already ${publishStatus}`)
    
    const updatedStatus = await Video.findByIdAndUpdate(videoId,
        {isPublished:publishStatus}
    )

    if(!updatedStatus) throw new ApiError(500,"Internal server error")

        
    return res.status(200).json(new ApiResponse(
        200,
        updatedStatus,
        "Status Updated Succesfully"
    ))
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getsingleVideo,
    getHomeVideos
}