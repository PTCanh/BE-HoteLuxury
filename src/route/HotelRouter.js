import express from "express";
import hotelController from "../controllers/HotelController.js"
import { authHotelManagerMiddleware, authUserMiddleware } from "../middlewares/authMiddleware.js";
import { upload, uploadToCloudinary, uploadMultipleToCloudinary, uploadHotelImagesToCloudinary } from "../utils/UploadFile.js";

const router = express.Router();

router.get('/most-booking', hotelController.getTop12MostBookingHotel)
router.get('/similar-hotel/:id', hotelController.getSimilarHotel)
router.get('/suggested-hotel', hotelController.suggestedHotel)
router.get('/user-filter', hotelController.userFilterHotel)
router.get('/filter', hotelController.filterHotel)
router.get('/search', hotelController.searchHotel)
router.post('/', authHotelManagerMiddleware, upload.fields([
    { name: "hotelImage", maxCount: 1 }, // Single file for thumbnail
    { name: "hotelImages", maxCount: 20 } // Multiple files for gallery
  ]), uploadHotelImagesToCloudinary, hotelController.createHotel)
router.put('/:id', authHotelManagerMiddleware, upload.fields([
    { name: "hotelImage", maxCount: 1 }, // Single file for thumbnail
    { name: "hotelImages", maxCount: 20 } // Multiple files for gallery
  ]), uploadHotelImagesToCloudinary, hotelController.updateHotel)
router.delete('/:id', authHotelManagerMiddleware, hotelController.deleteHotel)
router.get('/:id', hotelController.getDetailHotel)
router.get('/', hotelController.getAllHotel)


export default router