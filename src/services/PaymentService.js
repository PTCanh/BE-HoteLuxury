import crypto from 'crypto';
import axios from 'axios';
import momoConfig from '../config/momoConfig.js';
import bookingService from '../services/BookingService.js';
import Schedule from "../models/Schedule.js";
import Booking from "../models/Booking.js";


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

    console.log(rawSignature)

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
        console.log('Payment URL:', response);
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
            await bookingService.updateBooking({ status: "Đã thanh toán", isConfirmed: true }, bookingId);

            return res.redirect('https://hoteluxury.vercel.app/info/trips');
            // return res.status(200).json({
            //   status: "OK",
            //   message: "Payment successful",
            // });
        } else {
            // Thanh toán thất bại
            //await bookingService.updateBookingStatus(bookingId, "S3");
            await Booking.findOneAndUpdate({ bookingId: bookingId }, { status: "Đã hủy", isConfirmed: true }, { new: true })
            return res.redirect('https://hoteluxury.vercel.app/info/trips');
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
            errors:[{
                field:"",
                message:""
            }]
        });
    }
};

export default {
    createPaymentUrl,
    handlePaymentReturn
};