import express from "express";
import NotificationController from "../controllers/NotificationController.js"
import { authMiddleware , authHotelManagerMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/', authHotelManagerMiddleware, NotificationController.createNotification)
router.put('/:id',authHotelManagerMiddleware,  NotificationController.updateNotification)
router.delete('/:id',authHotelManagerMiddleware,  NotificationController.deleteNotification)
router.get('/', authHotelManagerMiddleware, NotificationController.getAllNotification)
router.put('/',authHotelManagerMiddleware,  NotificationController.readAllNotification)
router.delete('/',authHotelManagerMiddleware,  NotificationController.deleteAllNotification)

export default router