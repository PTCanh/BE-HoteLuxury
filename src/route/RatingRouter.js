import express from "express";
import ratingController from "../controllers/RatingController.js"
import { authMiddleware, authUserMiddleware } from "../middlewares/authMiddleware.js";
import { upload, uploadToCloudinary, uploadMultipleToCloudinary, uploadHotelImagesToCloudinary } from "../utils/UploadFile.js";

const router = express.Router();

router.post('/', authUserMiddleware, upload.array("ratingImages", 20), uploadMultipleToCloudinary, ratingController.createRating)
router.get('/', ratingController.getAllRatingByHotelId)


export default router