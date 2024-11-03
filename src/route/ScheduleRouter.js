import express from "express";
import scheduleController from "../controllers/ScheduleController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/search', scheduleController.searchSchedule)
router.post('/', scheduleController.createSchedule)
router.put('/:id', scheduleController.updateSchedule)
router.delete('/:id', scheduleController.deleteSchedule)
router.get('/:id', scheduleController.getDetailSchedule)
router.get('/', scheduleController.getAllSchedule)


export default router