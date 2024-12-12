import express from "express";
import ratingController from "../controllers/RatingController.js"
import { authMiddleware, authUserMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/', authUserMiddleware, ratingController.createRating)
router.get('/', ratingController.getAllRatingByHotelId)


export default router