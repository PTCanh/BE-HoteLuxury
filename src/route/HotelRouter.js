import express from "express";
import hotelController from "../controllers/HotelController.js"
import { authHotelManagerMiddleware, authUserMiddleware } from "../middlewares/authMiddleware.js";
import { upload, uploadToCloudinary, uploadMultipleToCloudinary } from "../utils/UploadFile.js";

const router = express.Router();

router.get('/suggested-hotel', hotelController.suggestedHotel)
router.get('/user-filter', hotelController.userFilterHotel)
router.get('/filter', hotelController.filterHotel)
router.get('/search', hotelController.searchHotel)
router.post('/', authHotelManagerMiddleware, upload.array("hotelImages", 10), uploadMultipleToCloudinary, hotelController.createHotel)
router.put('/:id', authHotelManagerMiddleware, upload.array("hotelImages", 10), uploadMultipleToCloudinary, hotelController.updateHotel)
router.delete('/:id', authHotelManagerMiddleware, hotelController.deleteHotel)
router.get('/:id', hotelController.getDetailHotel)
router.get('/', hotelController.getAllHotel)


export default router