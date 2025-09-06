import { Router } from "express";
import  {verifyJWT}  from "../middlewares/auth.middleware.js";
import { toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";


const router = Router()
router.use(verifyJWT)

router.route('/toggle-video-like/:videoId').post(toggleVideoLike)
router.route('/toggle-comment-like/:commentId').post(toggleCommentLike)

export default router