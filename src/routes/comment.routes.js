import { Router } from "express";
import  {verifyJWT}  from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";



const router = Router()
router.use(verifyJWT)

router.route('/get-comments/:videoId').get(getVideoComments)
router.route('/add-comment/:videoId').post(addComment)
router.route('/update-comment/:commentId').post(updateComment)
router.route('/delete-comment/:commentId').get(deleteComment)



export default router