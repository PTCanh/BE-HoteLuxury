import express from "express";
import adminController from "../controllers/AdminController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/homepage', authMiddleware, adminController.adminHomePage)

export default router