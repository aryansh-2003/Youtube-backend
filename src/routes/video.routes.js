import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getHomeVideos, getsingleVideo ,getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import {verifyJWT} from '../middlewares/auth.middleware.js'



const router = Router()

router.route('/upload-Video').post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),verifyJWT,publishAVideo)


router.route('/getVideos').get(getAllVideos)
router.route('/get-video-by-id/:videoId').get(verifyJWT,getVideoById)
router.route('/get-single-video/:videoId').get(getsingleVideo)
router.route('/update-video/:videoId').patch(upload.single("thumbnail"),verifyJWT,updateVideo)
router.route('/delete-Video/:videoId').delete(deleteVideo)
router.route('/toggle-status/:videoId').patch(togglePublishStatus)
router.route('/getHomevids').get(getHomeVideos)

export default router