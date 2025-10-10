import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subsubscription.controller.js";

const router = Router()
router.use(verifyJWT)


router.route("/subscribe/:channelId").post(toggleSubscription)
router.route("/get-subscribers/:channelId").get(getUserChannelSubscribers)
router.route("/get-subscribed-channel/:subscriberId").get(getSubscribedChannels)



export default router