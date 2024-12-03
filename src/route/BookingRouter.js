import express from "express";
import bookingController from "../controllers/BookingController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/by-hotel-manager', bookingController.getAllBookingByHotelManager)
router.get('/confirm/:id', bookingController.confirmBooking)
router.get("/momo_return", bookingController.handlePaymentReturn); // Định nghĩa tuyến đường để xử lý phản hồi từ MoMo
router.get('/search', bookingController.searchBooking)
router.post('/', bookingController.createBooking)
router.put('/:id', bookingController.updateBooking)
router.delete('/:id', bookingController.deleteBooking)
router.get('/:id', bookingController.getDetailBooking)
router.get('/', bookingController.getAllBooking)


export default router