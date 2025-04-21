import Rating from '../models/Rating.js'
import Hotel from '../models/Hotel.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import jwt from 'jsonwebtoken'


const createRating = async (headers, rating, bookingId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            rating.userId = decoded.userId
            // Tạo đánh giá mới
            const newRating = await Rating.create(rating)
            const checkHotel = await Hotel.findOne({hotelId: newRating.hotelId, isDeleted: false})
            // Lấy tất cả đánh giá của khách sạn
            const allRatings = await Rating.find({ hotelId: newRating.hotelId });

            // Tính tổng số sao và số lượng đánh giá
            const totalStars = allRatings.reduce((sum, r) => sum + r.ratingStar, 0);
            const ratingQuantity = allRatings.length;
            // Tính ratingAverage chính xác
            const newRatingAverage = parseFloat((totalStars / ratingQuantity).toFixed(1));

            const updateHotel = await Hotel.findOneAndUpdate({hotelId: newRating.hotelId, isDeleted: false},
                {
                    ratingQuantity: ratingQuantity,
                    ratingAverage: newRatingAverage
                },
                {new: true}
            )
            const updateBooking = await Booking.findOneAndUpdate({bookingId: bookingId},
                {
                    isRating: true
                },
                {new: true}
            )
            resolve({
                status: "OK",
                message: "Tạo đánh giá thành công",
                data: newRating
            })
        } catch (e) {
            reject(e)
            console.log(e)
        }
    });
};

const getAllRatingByHotelId = async (hotelId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const allRatings = await Rating.find({
                hotelId: hotelId
            }).populate({
                path: "userId",
                model: "Users",
                localField: "userId",
                foreignField: "userId",
                select: "fullname image",
            }).lean()
            resolve({
                status: "OK",
                message: "Xem tất cả đánh giá thành công",
                data: allRatings
            })
        } catch (e) {
            reject(e)
            console.log(e)
        }
    });
};

export default {
    createRating,
    getAllRatingByHotelId
}