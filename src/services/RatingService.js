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
            const checkHotel = await Hotel.findOne({ hotelId: newRating.hotelId, isDeleted: false })
            // Lấy tất cả đánh giá của khách sạn
            const allRatings = await Rating.find({ hotelId: newRating.hotelId });

            // Tính tổng số sao và số lượng đánh giá
            const totalStars = allRatings.reduce((sum, r) => sum + r.ratingStar, 0);
            const ratingQuantity = allRatings.length;
            // Tính ratingAverage chính xác
            const newRatingAverage = ratingQuantity
                ? parseFloat((totalStars / ratingQuantity).toFixed(1))
                : 0;

            const updateHotel = await Hotel.findOneAndUpdate({ hotelId: newRating.hotelId, isDeleted: false },
                {
                    ratingQuantity: ratingQuantity,
                    ratingAverage: newRatingAverage
                },
                { new: true }
            )
            const updateBooking = await Booking.findOneAndUpdate({ bookingId: bookingId },
                {
                    isRating: true
                },
                { new: true }
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

const getAllRatingByHotelId = async (query, headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            let allRatings = []

            const populateOptions = {
                path: "userId",
                model: "Users",
                localField: "userId",
                foreignField: "userId",
                select: "fullname image",
            }

            try {
                const token = headers.authorization?.split(' ')[1]
                const decoded = token && jwt.verify(token, process.env.ACCESS_TOKEN)

                if (decoded?.roleId === "R2") {
                    // Quản lý xem tất cả đánh giá (cả bị ẩn)
                    allRatings = await Rating.find({
                        hotelId: query.hotelId
                    }).populate(populateOptions).lean()
                } else {
                    // Người dùng thường hoặc không phải R2 → chỉ thấy đánh giá công khai
                    allRatings = await Rating.find({
                        hotelId: query.hotelId,
                        isHidden: false
                    }).populate(populateOptions).lean()
                }
            } catch {
                // Token không hợp lệ → chỉ trả về đánh giá công khai
                allRatings = await Rating.find({
                    hotelId: query.hotelId,
                    isHidden: false
                }).populate(populateOptions).lean()
            }

            const allRatingImages = allRatings.map(rating => rating.ratingImages || [])

            const allRatingImagesArray = allRatingImages.flat().filter(image => image !== null && image !== undefined)

            if (query.fullname) {
                const fullname = query.fullname.toLowerCase().trim()
                allRatings = allRatings.filter(rating => rating.userId?.fullname?.toLowerCase().includes(fullname))
            }
            if (query.filterStart && query.filterEnd) {
                allRatings = allRatings.filter(rating => {
                    const createdDay = rating.createdAt.toISOString().split('T')[0]
                    return (query.filterStart <= createdDay && createdDay <= query.filterEnd)
                })
            }

            resolve({
                status: "OK",
                message: "Xem tất cả đánh giá thành công",
                data: allRatings,
                allRatingImagesArray: allRatingImagesArray
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