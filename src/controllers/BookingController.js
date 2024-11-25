import bookingService from "../services/BookingService.js";
import paymentService from '../services/PaymentService.js';

const createBooking = async (req, res) => {
    try {
        const response = await bookingService.createBooking(req.body);
        console.log(response)
        if (response.status === "OK") {
            const paymentUrl = await paymentService.createPaymentUrl(response.data.bookingId.toString(), response.data.price, 'Payment for booking');
            return res.status(200).json({
                status: "OK",
                message: "Booking created successfully",
                paymentUrl: paymentUrl
            });
        } else {
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
        const response = await bookingService.updateBooking(req.body, id);
        return res.status(200).json(response);
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
        return res.status(200).json(response);
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
        const response = await bookingService.getAllBooking();
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

export default {
    createBooking,
    updateBooking,
    deleteBooking,
    getDetailBooking,
    getAllBooking,
    searchBooking,
    handlePaymentReturn
}