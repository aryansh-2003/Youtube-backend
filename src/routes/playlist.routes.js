import { Router } from "express";
import  {verifyJWT}  from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";



const router = Router();
router.use(verifyJWT)


router.route("/create-playlist").post(createPlaylist)
router.route("/get-playlist").get(getUserPlaylists)
router.route("/get-playlist-by-id/:playlistId").get(getPlaylistById)
router.route("/add-video/:playlistId/:videoId").patch(addVideoToPlaylist)
router.route("/remove-video/:playlistId/:videoId").delete(removeVideoFromPlaylist)
router.route("/delete-playlist/:playlistId").delete(deletePlaylist)
router.route("/update-playlist/:playlistId").patch(updatePlaylist)








export default router