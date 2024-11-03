import express from "express";
import cartController from "../controllers/CartController.js"
import { authMiddleware, authUserMiddleware, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/', verifyToken, cartController.addToCart)
router.delete('/:id', verifyToken, cartController.deleteRoomTypeFromCart)
router.get('/', verifyToken, cartController.getDetailCart)

export default router