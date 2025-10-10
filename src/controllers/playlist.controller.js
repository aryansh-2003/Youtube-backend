import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid")
    if (!name || !description) throw new ApiError(400 , "Name or description is missing");

    const response = await Playlist.create({
        name: name,
        description: description,
        owner:userId
    })

    if (!response) throw new ApiError(500, "Something went wrong!");

    res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Playlist created"
        )
    )
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.params
    //TODO: get user playlists

    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid");

    const response = await Playlist.find({
        owner: userId
    })

    if (!response) throw new ApiError(500, "Something went wrong!");

    res.status(200).json(
        new ApiResponse(
            200,
            response,
            "User Playlists"
        )
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid")

    if (!playlistId) throw new ApiError(400, "Playlist id missing");

    const response = await Playlist.findById(playlistId)


    if (!response) throw new ApiError(500, "Something went wrong!");


      res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Playlist Found"
        )
    )


})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid")

    if (!playlistId || !videoId) throw new ApiError(400, "Playlist id or Video id is missing");

    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet: {videos:videoId}
        },
        { new:true }
    )


    if (!updatePlaylist) throw new ApiError(500,"Something went wrong!");

    const response = await Playlist.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"videos",
                foreignField: "_id",
                as: "VideoDetails",
                pipeline:[
                    {
                        $project:{
                            thumbnail:1,
                            title:1,
                            duration:1,
                            views:1,
                            owner:1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                name:1,
                description:1,
                videos:1,
                owner:1,
                VideoDetails:1
            }
        }
    ]) 

    if (!response) throw new ApiError(500, "Something went wrong!");

    res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Video added succesfully"
        )
    )

    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

      const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid")

    if (!playlistId || !videoId) throw new ApiError(400, "Playlist id or Video id is missing");

    const response = await Playlist.findByIdAndUpdate(playlistId,{
       $pull: { videos:videoId }
    })
    
    if (!response) throw new ApiError(500, "Something went wrong!");

    res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Video deleted succesfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const userId = req.user._id


    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid")
    if (!playlistId) throw new ApiError(400, "Playlist id is missing");

    const response = await Playlist.findByIdAndDelete(playlistId)

    if (!response) throw new ApiError(400, "Something went wrong!");

    return res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Deleted playlist completed"
        )
    )


})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    const userId = req.user._id


    if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "User id is invalid")
    //TODO: update playlist
    if (!playlistId) throw new ApiError(400, "Playlist id is missing");

    if (!name || !description) throw new ApiError(400, "Name or description is missing id is missing");

    const response = await Playlist.findByIdAndUpdate(playlistId,{
        name:name,
        description:description
    })


     return res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Updated playlist completed"
        )
    )



})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}