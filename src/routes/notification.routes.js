import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {getNotifications} from '../controllers/notification.controller.js'


const router = Router()
router.use(verifyJWT)

router.route("/get-notifications").get(getNotifications)

export default router