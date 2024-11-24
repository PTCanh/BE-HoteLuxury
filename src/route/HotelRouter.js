import express from "express";
import hotelController from "../controllers/HotelController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../utils/UploadFile.js";

const router = express.Router();

router.get('/suggested-hotel', hotelController.suggestedHotel)
router.get('/user-filter', hotelController.userFilterHotel)
router.get('/filter', hotelController.filterHotel)
router.get('/search', hotelController.searchHotel)
router.post('/', upload.single("hotelImage"), hotelController.createHotel)
router.put('/:id', upload.single("hotelImage"), hotelController.updateHotel)
router.delete('/:id', hotelController.deleteHotel)
router.get('/:id', hotelController.getDetailHotel)
router.get('/', hotelController.getAllHotel)


export default router