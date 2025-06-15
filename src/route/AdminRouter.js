import express from "express";
import adminController from "../controllers/AdminController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/homepage', authMiddleware, adminController.adminHomePage)
router.get('/avatar', authMiddleware, adminController.adminAvatar)
router.get('/hotel', authMiddleware, adminController.getAllHotel)
router.get('/voucher', authMiddleware, adminController.getAllVoucher)
router.put('/rating/:id', authMiddleware, adminController.updateRating)
router.delete('/rating/:id', authMiddleware, adminController.deleteRating)
router.get('/rating', authMiddleware, adminController.getAllRating)

export default router