import express from "express";
import bookingController from "../controllers/BookingController.js"
import { authHotelManagerMiddleware, authUserMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/final-price', authUserMiddleware, bookingController.calculateFinalPrice)
router.get('/by-partner', authHotelManagerMiddleware, bookingController.getAllBookingByHotelManager)
router.get('/confirm/:id', authHotelManagerMiddleware, bookingController.confirmBooking)
router.get("/momo_return", bookingController.handlePaymentReturn); // Định nghĩa tuyến đường để xử lý phản hồi từ MoMo
router.get('/search', bookingController.searchBooking)
router.post('/', authUserMiddleware, bookingController.createBooking)
router.put('/:id', authUserMiddleware, bookingController.updateBooking)
router.delete('/:id', bookingController.deleteBooking)
router.get('/:id', authUserMiddleware, bookingController.getDetailBooking)
router.get('/', authUserMiddleware, bookingController.getAllBooking)


export default router