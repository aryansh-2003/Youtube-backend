import { Router } from "express";
import  {verifyJWT}  from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";


const router = Router()
router.use(verifyJWT)

router.route('/toggle-video-like/:videoId').post(toggleVideoLike)
router.route('/toggle-comment-like/:commentId').patch(toggleCommentLike)
router.route('/toggle-tweet-like/:tweetId').post(toggleTweetLike)
router.route('/liked-videos').get(getLikedVideos)



export default router