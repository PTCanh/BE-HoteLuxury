import express from "express";
import { createUserController,loginUserController,updateUserController, deleteUserController, getAllUserController, 
    getDetailsUserController, refreshToken, logoutUserController, resetUserPasswordController, 
    handleResetPasswordTokenController, verifyUserController,
    createAndSendOTPController, filterUserController, getAllHotelManagerController, updatePasswordController,
    hotelManagerDashboardController} from "../controllers/UserController.js";
import { authMiddleware, authHotelManagerMiddleware, authUserMiddleware, verifyToken } from "../middlewares/authMiddleware.js";
import { upload, uploadToCloudinary } from "../utils/UploadFile.js";

const router = express.Router();

router.post('/sign-up',createAndSendOTPController)
router.post('/verify-account/:token',verifyUserController)
router.post('/sign-in',loginUserController)
router.post('/logout', logoutUserController)
router.post('/reset-password', resetUserPasswordController)
router.get('/reset-password/:token', handleResetPasswordTokenController)
//CRUD User
router.get('/hotel-manager/dashboard', authHotelManagerMiddleware, hotelManagerDashboardController)
router.get('/hotel-manager', getAllHotelManagerController)
router.get('/filter', filterUserController)
router.post('/', authMiddleware, upload.single("image"), uploadToCloudinary, createUserController)
router.put('/:id', verifyToken, upload.single("image"), uploadToCloudinary, updateUserController)
router.delete('/:id', authMiddleware, deleteUserController)
router.get('/', getAllUserController)
router.get('/:id', getDetailsUserController)
router.post("/update-password", verifyToken, updatePasswordController);
//authentication
router.post('/refresh_token',refreshToken)

export default router
