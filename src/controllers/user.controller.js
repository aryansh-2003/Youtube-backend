import {asyncHandler} from '../utils/asyncHandler.js'
import{ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloud} from '../utils/cloudinary.js'
import {ApiResponse} from "../utils/ApiResponse.js"

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

    const existedUser = User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409, "User already Exist either with email or username")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

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


export{registerUser}