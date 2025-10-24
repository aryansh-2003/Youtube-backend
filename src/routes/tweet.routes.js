import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";


const router = Router();
router.use(verifyJWT);


router.route('/create-tweet').post(createTweet)
router.route('/user-tweets/:userId').get(getUserTweets)
router.route('/edit-tweet/:tweetId').patch(updateTweet)
router.route("/delete-tweet/:tweetId").delete(deleteTweet)




export default router