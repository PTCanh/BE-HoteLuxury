import express from "express";
import { createUserController,loginUserController,updateUserController, deleteUserController, getAllUserController, 
    getDetailsUserController, refreshToken, logoutUserController, resetUserPasswordController, 
    handleResetPasswordTokenController, handleResetPasswordController, verifyUserController,
    createAndSendOTPController, filterUserController, getAllHotelManagerController, updatePasswordController,
    hotelManagerDashboardController, googleLoginUserController} from "../controllers/UserController.js";
import { authMiddleware, authHotelManagerMiddleware, authUserMiddleware, verifyToken } from "../middlewares/authMiddleware.js";
import { upload, uploadToCloudinary } from "../utils/UploadFile.js";

const router = express.Router();

router.post('/sign-up',createAndSendOTPController)
router.post('/verify-account/:token',verifyUserController)
router.post('/sign-in',loginUserController)
router.post('/google-sign-in',googleLoginUserController)
router.post('/logout', logoutUserController)
router.post('/forgot-password', resetUserPasswordController)
router.post('/forgot-password/:token', handleResetPasswordTokenController)
router.post('/reset-password/:token', handleResetPasswordController)
//authentication
router.post('/refresh-token',refreshToken)

export default router