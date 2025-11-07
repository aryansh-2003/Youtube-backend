import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { createTweet, deleteTweet, getUserTweets, homeTweets, likedTweets, updateTweet } from "../controllers/tweet.controller.js";


const router = Router();
router.use(verifyJWT);


router.route('/create-tweet').post(createTweet)
router.route('/user-tweets/:userId').get(getUserTweets)
router.route('/edit-tweet/:tweetId').patch(updateTweet)
router.route("/delete-tweet/:tweetId").delete(deleteTweet)
router.route("/home-tweets").get(homeTweets)
router.route("/liked-tweets").get(likedTweets)





export default router