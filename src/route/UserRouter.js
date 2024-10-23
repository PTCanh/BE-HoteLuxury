import express from "express";
import { createUserController,loginUserController,updateUserController, deleteUserController, getAllUserController, 
    getDetailsUserController, refreshToken, logoutUserController, resetUserPasswordController, 
    handleResetPasswordTokenController, verifyUserController,
    createAndSendOTPController} from "../controllers/UserController.js";
import { authMiddleware,authUserMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/sign-up',createAndSendOTPController)
router.post('/verify-account/:token',verifyUserController)
router.post('/sign-in',loginUserController)
router.post('/logout', logoutUserController)
router.post('/reset-password', resetUserPasswordController)
router.get('/reset-password/:token', handleResetPasswordTokenController)
router.post('/create-user',createUserController)
router.put('/update-user/:id',updateUserController)
router.delete('/delete-user/:id',authMiddleware ,deleteUserController)
router.get('/get-all',authMiddleware, getAllUserController)
router.get('/get-details/:id',authUserMiddleware , getDetailsUserController)
router.post('/refresh_token',refreshToken)

export default router
