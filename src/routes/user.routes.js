import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAcessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getUserChannelProfile, getWatchHistory, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'


const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)


//Secured routes

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAcessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/updateavatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/updatecover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/user-channel-profile/:username").get(verifyJWT, getUserChannelProfile)
router.route('/history').get(verifyJWT,getWatchHistory)



export default router