import express from "express";
import scheduleController from "../controllers/ScheduleController.js"
import { authMiddleware, authHotelManagerMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/search', authHotelManagerMiddleware, scheduleController.searchSchedule)
router.post('/', authHotelManagerMiddleware, scheduleController.createSchedule)
router.put('/:id', authHotelManagerMiddleware, scheduleController.updateSchedule)
router.delete('/:id', authHotelManagerMiddleware, scheduleController.deleteSchedule)
router.get('/:id', authHotelManagerMiddleware, scheduleController.getDetailSchedule)
router.get('/', authHotelManagerMiddleware, scheduleController.getAllSchedule)


export default router