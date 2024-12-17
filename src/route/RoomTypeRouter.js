import express from "express";
import roomTypeController from "../controllers/RoomTypeController.js"
import { authMiddleware, authHotelManagerMiddleware } from "../middlewares/authMiddleware.js";
import { upload, uploadToCloudinary } from "../utils/UploadFile.js";

const router = express.Router();

router.get('/available', roomTypeController.availableRoomTypes)
router.get('/by-hotel-manager/:id', roomTypeController.getDetailRoomTypeByHotelManager)
router.get('/find-by-hotelId/:hotelId', roomTypeController.getRoomTypeByHotelId)
router.get('/filter', roomTypeController.filterRoomType)
router.post('/', authHotelManagerMiddleware, upload.single("roomTypeImage"), uploadToCloudinary, roomTypeController.createRoomType)
router.put('/:id', authHotelManagerMiddleware, upload.single("roomTypeImage"), uploadToCloudinary, roomTypeController.updateRoomType)
router.delete('/:id', authHotelManagerMiddleware, roomTypeController.deleteRoomType)
router.get('/:id', roomTypeController.getDetailRoomType)
router.get('/', roomTypeController.getAllRoomType)


export default router