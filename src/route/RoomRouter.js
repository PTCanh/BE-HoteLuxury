import express from "express";
import roomController from "../controllers/RoomController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/filter', roomController.filterRoom)
router.post('/', roomController.createRoom)
router.put('/:id', roomController.updateRoom)
router.delete('/:id', roomController.deleteRoom)
router.get('/:id', roomController.getDetailRoom)
router.get('/', roomController.getAllRoom)


export default router