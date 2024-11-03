import bookingService from "../services/BookingService.js";

const createBooking = async (req, res) => {
    try {
        const response = await bookingService.createBooking(req.body);
        return res.status(200).json(response);
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

export default {
    createBooking,
    updateBooking,
    deleteBooking,
    getDetailBooking,
    getAllBooking,
    searchBooking
}