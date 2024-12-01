import express from "express";
import ratingController from "../controllers/RatingController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/', ratingController.createRating)
router.get('/', ratingController.getAllRatingByHotelId)


export default router