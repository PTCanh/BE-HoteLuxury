import crypto from 'crypto';
import axios from 'axios';
import momoConfig from '../config/momoConfig.js';
import bookingService from '../services/BookingService.js';
import Schedule from "../models/Schedule.js";
import Booking from "../models/Booking.js";
import User from '../models/User.js'
import Voucher from '../models/Voucher.js'
import notificationService from "../services/NotificationService.js";

const createPaymentUrl = async (bookingId, amount, orderInfo) => {
    const requestId = bookingId + '_' + new Date().getTime();
    const orderId = bookingId + '_' + new Date().getTime();
    const requestType = momoConfig.requestType;
    const redirectUrl = momoConfig.redirectUrl;
    const ipnUrl = momoConfig.ipnUrl;
    const extraData = ''; // Pass empty value if your merchant does not have stores

    // const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    // const signature = crypto.createHmac('sha256', momoConfig.secretKey).update(rawSignature).digest('hex');

    const rawSignature = "accessKey=" + momoConfig.accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl
        + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + momoConfig.partnerCode + "&redirectUrl=" + redirectUrl
        + "&requestId=" + requestId + "&requestType=" + requestType;

    //console.log(rawSignature)

    var signature = crypto.createHmac('sha256', momoConfig.secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = {

        partnerCode: momoConfig.partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: 'vi',
        requestType: requestType,
        autoCapture: true,
        extraData: extraData,
        orderGroupId: '',
        signature: signature
    };

    try {
        const response = await axios.post(momoConfig.endpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        //console.log('Payment URL:', response);
        // const bookingId = response.data.requestId.split('_')[0];
        // await bookingService.updateBookingStatus(bookingId, "S2");
        const bookingIdFromRequestId = response.data.requestId.split('_')[0];
        await bookingService.updateBookingPaymentUrl(bookingIdFromRequestId, response.data.payUrl);
        return response.data.payUrl;
    } catch (error) {
        console.error('Error creating payment URL:', error.response ? error.response.data : error.message);
        throw error;
    }
};
const handlePaymentReturn = async (req, res) => {
    try {
        //console.log('QUERYYYYY', req.query);
        const { orderId, resultCode } = req.query;
        const bookingId = orderId.split('_')[0];

        if (resultCode === '0') {
            // Thanh toán thành công
            const newBooking = await bookingService.updateBooking({ status: "Đã thanh toán" }, bookingId);
            if (newBooking.voucherCode) {
                const checkVoucher = await Voucher.findOne({ code: newBooking.voucherCode })
                const newQuantity = checkVoucher.quantity - 1
                await Voucher.findOneAndUpdate({ voucerId: checkVoucher.voucerId }, { quantity: newQuantity }, { new: true })
            }
            if (newBooking.point > 0) {
                const checkUser = await User.findOne({ userId: newBooking.userId })
                const newPoint = checkUser.point - newBooking.point
                await User.findOneAndUpdate({ userId: checkUser.userId }, { point: newPoint }, { new: true })
            }
            const point = Math.floor(Number(newBooking.finalPrice) / 100000);
            await PointHistory.create({
                userId: newBooking.userId,
                point: point,
                description: `Bạn được cộng ${point} điểm vì đã đặt đơn ${newBooking.bookingCode}`
            })
            if (newBooking.point > 0) {
                await PointHistory.create({
                    userId: newBooking.userId,
                    point: newBooking.point,
                    description: `Bạn đã bị trừ ${newBooking.point} điểm vì đã sử dụng khi đặt đơn ${newBooking.bookingCode}`,
                    isPlus: false
                })
            }
            const createdAtUTC = new Date(response.data.createdAt);

            const padZero = (num) => num.toString().padStart(2, '0');

            const hours = padZero(createdAtUTC.getHours());
            const minutes = padZero(createdAtUTC.getMinutes());
            const seconds = padZero(createdAtUTC.getSeconds());

            const day = padZero(createdAtUTC.getDate());
            const month = padZero(createdAtUTC.getMonth() + 1); // tháng bắt đầu từ 0
            const year = createdAtUTC.getFullYear();

            const formatted = `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`; // vào lúc ${formatted}
            await notificationService.createNotification({
                userId: newBooking.partnerId,
                type: "booking",
                title: "Có đơn đặt phòng mới",
                content: `Khách hàng ${newBooking.data.customerName} vừa đặt ${newBooking.data.roomQuantity} phòng ${newBooking.roomTypeName}`
            })

            const io = req.app.get("io");
            const partners = req.app.get("connectedPartners");
            const partnerId = newBooking.partnerId;
            const socketId = partners.get(partnerId);

            if (socketId) {
                io.to(socketId).emit("new-booking", newBooking.data);
            }

            return res.redirect('http://localhost:3000/dashboard/trips?type=1');
            //return res.redirect('https://hoteluxury.vercel.app/dashboard/trips');
            // return res.status(200).json({
            //   status: "OK",
            //   message: "Payment successful",
            // });
        } else {
            // Thanh toán thất bại
            //await bookingService.updateBookingStatus(bookingId, "S3");
            //await Booking.findOneAndUpdate({ bookingId: bookingId }, { status: "Đã hủy", isConfirmed: true }, { new: true })

            //Xóa luôn booking
            await Booking.findOneAndDelete({ bookingId: bookingId })

            return res.redirect('http://localhost:3000');
            //return res.redirect('https://hoteluxury.vercel.app/dashboard/trips');
            // return res.status(400).json({
            //     status: "ERR",
            //     message: "Payment failed",
            // });
        }
    } catch (error) {
        console.error('Error handling payment return:', error.message);
        return res.status(500).json({
            status: "ERR",
            message: "Lỗi server",
        });
    }
};

export default {
    createPaymentUrl,
    handlePaymentReturn
};