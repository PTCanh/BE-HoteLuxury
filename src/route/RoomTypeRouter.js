import express from "express";
import roomTypeController from "../controllers/RoomTypeController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/filter', roomTypeController.filterRoomType)
router.post('/', roomTypeController.createRoomType)
router.put('/:id', roomTypeController.updateRoomType)
router.delete('/:id', roomTypeController.deleteRoomType)
router.get('/:id', roomTypeController.getDetailRoomType)
router.get('/', roomTypeController.getAllRoomType)


export default router