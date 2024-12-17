import express from "express";
import hotelController from "../controllers/HotelController.js"
import { authHotelManagerMiddleware, authUserMiddleware } from "../middlewares/authMiddleware.js";
import { upload, uploadToCloudinary } from "../utils/UploadFile.js";

const router = express.Router();

router.get('/suggested-hotel', hotelController.suggestedHotel)
router.get('/user-filter', hotelController.userFilterHotel)
router.get('/filter', hotelController.filterHotel)
router.get('/search', hotelController.searchHotel)
router.post('/', authHotelManagerMiddleware, upload.single("hotelImage"), uploadToCloudinary, hotelController.createHotel)
router.put('/:id', authHotelManagerMiddleware, upload.single("hotelImage"), uploadToCloudinary, hotelController.updateHotel)
router.delete('/:id', authHotelManagerMiddleware, hotelController.deleteHotel)
router.get('/:id', hotelController.getDetailHotel)
router.get('/', hotelController.getAllHotel)


export default router