import {asyncHandler} from '../utils/asyncHandler.js'
import{ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloud} from '../utils/cloudinary.js'
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAcessAndRefreshTokens = async (userId) =>
{
    try {
        const user = await User.findById(userId)
        const acessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ValidateBeforeSave: false})

        return{acessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500,"something went wrong while generating tokens")
    }
}

//get detail from frontend
//Validation - not empty
//check if user already exist: username,email
// check for images, check for avatar
//upload them to cloudinary
//create user object -  create entry in db
//remove password and refresh token field from response
//check for user creation 
//return res


const registerUser = asyncHandler( async (req, res) => {
   
    const {username, email, fullname, password} = req.body
    console.log("email: ", email ,"\n password: ", password)

   if (
    [fullname,email,username,password].some((field) => field?.trim() === "")
   ) {
     throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409, "User already Exist either with email or username")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloud(avatarLocalPath)
    const coverImage  = await uploadOnCloud(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong whilw registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Succesfully")
    )
})

//req body -> data
// username or email
// find the user
// password check
// access and refresh token
// send secure cookie

const loginUser = asyncHandler(async(req,res)=>{

    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400, "Username and Email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credintials")
    }
    console.log(user._id)

    const {acessToken, refreshToken} = await generateAcessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("acessToken",acessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser, acessToken, refreshToken
            },
            "user logged in succesfully"
        )
    )
})


const logoutUser = asyncHandler(async(req, res) =>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { 
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
     
    const options = {
        httpOnly: true,
        secure:true    
    }

    return res
    .status(200)
    .clearCookie("acessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,"User logged out succesfully"))
})


const refreshAcessToken = asyncHandler(async (req,res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken) throw new ApiError(401, "Unauthorize Request")

try {
       const decodedToken = jwt.verify(
        incomingRefreshToken, 
        process.env.REFRESH_TOKEN_SECRET
        )
    
       const user = await User.findById(decodedToken?._id)
    
       if(!user) throw new ApiError(401, "Invalid Refresh Token")
    
       if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired or used")
    
       const option = {
        httpOnly: true,
        secure: true
       }
    
       const {accessToken, newRefreshToken} = await generateAcessAndRefreshTokens(user._id)
    
       return res
       .status(200)
       .cookie("accessToken",accessToken,option)
       .cookie("refreshToken",newRefreshToken,option)
       .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "AccessToken refreshed"
        )
       )
} catch (error) {
    throw new ApiError(500,error.message || "Invalid refresh token")
    
}
})


export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken
}