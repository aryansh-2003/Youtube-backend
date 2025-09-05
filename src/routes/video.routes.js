import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import {verifyJWT} from '../middlewares/auth.middleware.js'



const router = Router()

router.route('/upload-Video/:userId').post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),publishAVideo)


router.route('/getVideos').get(getAllVideos)
router.route('/get-video-by-id/:videoId').get(getVideoById)
router.route('/update-video/:videoId/:userId').post(upload.single("thumbnail"),updateVideo)
router.route('/delete-Video/:videoId').post(deleteVideo)
router.route('/toggle-status/:videoId').post(togglePublishStatus)

export default router