import { Router } from "express";

import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAcessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory,
  updateUserCoverImage,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User registration, authentication and profile APIs
 */

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - username
 *               - password
 *               - avatar
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               username:
 *                 type: string
 *                 example: john123
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *               avatar:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Required fields or avatar missing
 *       409:
 *         description: Email or username already exists
 *       500:
 *         description: Registration failed
 */
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Log in using username or email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john123
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *             description: Supply username or email along with password.
 *     responses:
 *       200:
 *         description: Login successful. Tokens are returned and set in cookies.
 *       400:
 *         description: Username or email is required
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User does not exist
 */
router.route("/login").post(loginUser);

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out and authentication cookies cleared
 *       401:
 *         description: Unauthorized
 */
router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Generate a new access token
 *     tags: [Users]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional when the refreshToken cookie is available.
 *     responses:
 *       200:
 *         description: Access and refresh tokens generated successfully
 *       401:
 *         description: Refresh token missing, invalid, or expired
 *       500:
 *         description: Token refresh failed
 */
router.route("/refresh-token").post(refreshAcessToken);

/**
 * @swagger
 * /api/v1/users/change-password:
 *   post:
 *     summary: Change the current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Old password is incorrect
 *       401:
 *         description: Unauthorized
 */
router.route("/change-password").post(
  verifyJWT,
  changeCurrentPassword
);

/**
 * @swagger
 * /api/v1/users/current-user:
 *   get:
 *     summary: Get the currently authenticated user's details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/current-user").get(
  verifyJWT,
  getCurrentUser
);

/**
 * @swagger
 * /api/v1/users/update-account:
 *   patch:
 *     summary: Update account details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - username
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: john_updated
 *     responses:
 *       200:
 *         description: Account details updated successfully
 *       400:
 *         description: Required account fields are missing
 *       401:
 *         description: Unauthorized
 */
router.route("/update-account").patch(
  verifyJWT,
  updateAccountDetails
);

/**
 * @swagger
 * /api/v1/users/updateavatar:
 *   patch:
 *     summary: Update the current user's avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: Avatar file missing or upload failed
 *       401:
 *         description: Unauthorized
 */
router.route("/updateavatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

/**
 * @swagger
 * /api/v1/users/updatecover-image:
 *   patch:
 *     summary: Update the current user's cover image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - coverImage
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cover image updated successfully
 *       400:
 *         description: Cover image missing or upload failed
 *       401:
 *         description: Unauthorized
 */
router.route("/updatecover-image").patch(
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

/**
 * @swagger
 * /api/v1/users/user-channel-profile/{username}:
 *   get:
 *     summary: Get a user's channel profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: john123
 *     responses:
 *       200:
 *         description: Channel profile fetched successfully
 *       400:
 *         description: Username is missing
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Channel does not exist
 */
router.route("/user-channel-profile/:username").get(
  verifyJWT,
  getUserChannelProfile
);

/**
 * @swagger
 * /api/v1/users/history:
 *   get:
 *     summary: Get the current user's watch history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watch history fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/history").get(
  verifyJWT,
  getWatchHistory
);

export default router;
