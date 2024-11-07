import express from "express";
import hotelController from "../controllers/HotelController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/filter', hotelController.filterHotel)
router.get('/admin-filter', hotelController.adminFilterHotel)
router.get('/search', hotelController.searchHotel)
router.post('/', hotelController.createHotel)
router.put('/:id', hotelController.updateHotel)
router.delete('/:id', hotelController.deleteHotel)
router.get('/:id', hotelController.getDetailHotel)
router.get('/', hotelController.getAllHotel)


export default router