import bookingService from "../services/BookingService.js";
import paymentService from '../services/PaymentService.js';

const createBooking = async (req, res) => {
    try {
        const response = await bookingService.createBooking(req.body);
        //console.log(response)
        if (response.status === "OK" && response.data.paymentMethod === "Online") {
            const paymentUrl = await paymentService.createPaymentUrl(response.data.bookingId.toString(), response.data.price, 'Payment for booking');
            return res.status(200).json({
                status: "OK2",
                message: "Booking created successfully",
                data: paymentUrl
            });
        } else if (response.status === "OK" && response.data.paymentMethod === "Trực tiếp") {
            const io = req.app.get("io");
            const partners = req.app.get("connectedPartners");
            const partnerId = response.partnerId;
            const socketId = partners.get(partnerId);

            if (socketId) {
                io.to(socketId).emit("new-booking", response.data);
            }
            return res.status(response.statusCode).json(response);
        }
        else {
            return res.status(404).json(response);
        }
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const updateBooking = async (req, res) => {
    const id = req.params.id
    try {
        const response = await bookingService.updateBooking(req.body, id, req.headers);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const deleteBooking = async (req, res) => {
    const id = req.params.id
    try {
        const response = await bookingService.deleteBooking(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getDetailBooking = async (req, res) => {
    const id = req.params.id
    try {
        const response = await bookingService.getDetailBooking(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getAllBooking = async (req, res) => {
    try {
        const response = await bookingService.getAllBooking(req.headers, req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const searchBooking = async (req, res) => {
    try {
        const response = await bookingService.searchBooking(req.headers);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const handlePaymentReturn = async (req, res) => {
    //console.log('TEST HANDLE PAYMENT RETURN'); 
    //console.log('Response',res);
    return paymentService.handlePaymentReturn(req, res);
};

const confirmBooking = async (req, res) => {
    const id = req.params.id
    try {
        const response = await bookingService.confirmBooking(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getAllBookingByHotelManager = async (req, res) => {
    try {
        const response = await bookingService.getAllBookingByHotelManager(req.headers, req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

export default {
    createBooking,
    updateBooking,
    deleteBooking,
    getDetailBooking,
    getAllBooking,
    searchBooking,
    handlePaymentReturn,
    confirmBooking,
    getAllBookingByHotelManager
}