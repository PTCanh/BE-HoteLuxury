import express from "express";
import roomController from "../controllers/RoomController.js"
import { authMiddleware , authHotelManagerMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/filter', authHotelManagerMiddleware, roomController.filterRoom)
router.post('/', authHotelManagerMiddleware, roomController.createRoom)
router.put('/:id', authHotelManagerMiddleware, roomController.updateRoom)
router.delete('/:id',authHotelManagerMiddleware,  roomController.deleteRoom)
router.get('/:id', authHotelManagerMiddleware, roomController.getDetailRoom)
router.get('/', authHotelManagerMiddleware, roomController.getAllRoom)


export default router