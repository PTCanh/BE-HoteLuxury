import express from "express";
import adminController from "../controllers/AdminController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/homepage', authMiddleware, adminController.adminHomePage)
router.get('/avatar', authMiddleware, adminController.adminAvatar)
router.get('/hotel', authMiddleware, adminController.getAllHotel)
router.get('/voucher', authMiddleware, adminController.getAllVoucher)

export default router