import express from "express";
import roomTypeController from "../controllers/RoomTypeController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../utils/UploadFile.js";

const router = express.Router();

router.get('/find-by-hotelId/:hotelId', roomTypeController.getRoomTypeByHotelId)
router.get('/filter', roomTypeController.filterRoomType)
router.post('/', upload.single("roomTypeImage"), roomTypeController.createRoomType)
router.put('/:id', upload.single("roomTypeImage"), roomTypeController.updateRoomType)
router.delete('/:id', roomTypeController.deleteRoomType)
router.get('/:id', roomTypeController.getDetailRoomType)
router.get('/', roomTypeController.getAllRoomType)


export default router