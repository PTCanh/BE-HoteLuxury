import bookingService from "../services/BookingService.js";
import paymentService from '../services/PaymentService.js';
import notificationService from "../services/NotificationService.js";

const createBooking = async (req, res) => {
    try {
        const response = await bookingService.createBooking(req.body);
        //console.log(response)
        if (response.status === "OK" && response.data.paymentMethod === "Online") {
            const paymentUrl = await paymentService.createPaymentUrl(response.data.bookingId.toString(), response.data.finalPrice, 'Payment for booking');
            return res.status(200).json({
                status: "OK2",
                message: "Booking created successfully",
                data: paymentUrl
            });
        } else if (response.status === "OK" && response.data.paymentMethod === "Trực tiếp") {
            const createdAtUTC = new Date(response.data.createdAt);

            const padZero = (num) => num.toString().padStart(2, '0');

            const hours = padZero(createdAtUTC.getHours());
            const minutes = padZero(createdAtUTC.getMinutes());
            const seconds = padZero(createdAtUTC.getSeconds());

            const day = padZero(createdAtUTC.getDate());
            const month = padZero(createdAtUTC.getMonth() + 1); // tháng bắt đầu từ 0
            const year = createdAtUTC.getFullYear();

            const formatted = `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`; //vào lúc ${formatted}
            await notificationService.createNotification({
                userId: response.partnerId,
                type: "booking",
                title: "Có đơn đặt phòng mới",
                content: `Khách hàng ${response.data.customerName} vừa đặt ${response.data.roomQuantity} phòng ${response.roomTypeName}`
            })
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
        console.log(e)
        return res.status(404).json({
            message: e,
        });
    }
};

const updateBooking = async (req, res) => {
    const id = req.params.id
    try {
        const response = await bookingService.updateBooking(req.body, id, req.headers);
        if(response.cancelBookingFlag){
            await notificationService.createNotification({
                userId: response.partnerId,
                type: "booking",
                title: "Có đơn đặt phòng bị hủy",
                content: `Khách hàng ${response.data.customerName} vừa hủy đơn đặt phòng ${response.data.bookingCode}`
            })
            const io = req.app.get("io");
            const partners = req.app.get("connectedPartners");
            const partnerId = response.partnerId;
            const socketId = partners.get(partnerId);

            if (socketId) {
                io.to(socketId).emit("cancel-booking", response.data);
            }
        }
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

const calculateFinalPrice = async (req, res) => {
    try {
        const response = await bookingService.calculateFinalPrice(req.body);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
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
    getAllBookingByHotelManager,
    calculateFinalPrice
}