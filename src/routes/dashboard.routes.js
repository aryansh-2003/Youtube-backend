import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";



const router = Router()


router.route("/dashboard/:userId/:videoId").get(getChannelStats)
router.route("/get-channel-videos/:userId").get(getChannelVideos)


export default router