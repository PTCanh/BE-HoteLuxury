import express from "express";
import bookingController from "../controllers/BookingController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/search', bookingController.searchBooking)
router.post('/', bookingController.createBooking)
router.put('/:id', bookingController.updateBooking)
router.delete('/:id', bookingController.deleteBooking)
router.get('/:id', bookingController.getDetailBooking)
router.get('/', bookingController.getAllBooking)


export default router