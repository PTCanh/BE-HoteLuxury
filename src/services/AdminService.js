import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import jwt from 'jsonwebtoken'

const adminHomePage = async (query) => {
  return new Promise(async (resolve, reject) => {
    // Ngày đầu tiên của tháng hiện tại
    const startDate = new Date(query.year, query.month - 1, 1);

    // Ngày đầu tiên của tháng tiếp theo (để xác định khoảng thời gian của tháng hiện tại)
    const endDate = new Date(query.year, query.month, 1);

    try {
      const getHotelStatsByMonth = await Booking.aggregate([
        {
          $match: {
            status: 'Đã thanh toán',
            dayEnd: { $gte: startDate, $lt: endDate }
          }
        },
        {
          $lookup: {
            from: 'roomtypes',
            let: { roomTypeId: '$roomTypeId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$roomTypeId', '$$roomTypeId'] } } }
            ],
            as: 'roomType'
          }
        },
        { $unwind: '$roomType' },
        {
          $lookup: {
            from: 'hotels',
            let: { hotelId: '$roomType.hotelId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$hotelId', '$$hotelId'] } } }
            ],
            as: 'hotel'
          }
        },
        { $unwind: '$hotel' },
        {
          $group: {
            _id: '$roomType.hotelId',
            hotelId: { $first: '$roomType.hotelId' },
            hotelName: { $first: '$hotel.hotelName' },
            totalBooking: { $sum: 1 },
            totalPrice: { $sum: { $toDouble: '$price' } }
          }
        },
        {
          $addFields: {
            commission: {
              $cond: [
                { $and: [{ $gte: ['$totalBooking', 5] }, { $gte: ['$totalPrice', 20000000] }] },
                { $multiply: ['$totalPrice', 0.06] },
                {
                  $cond: [
                    { $gte: ['$totalBooking', 5] },
                    { $multiply: ['$totalPrice', 0.04] },
                    { $multiply: ['$totalPrice', 0.02] }
                  ]
                }
              ]
            }
          }
        },
        {
          $project: {
            _id: 0,
            hotelId: 1,
            hotelName: 1,
            totalBooking: 1,
            totalPrice: 1,
            commission: { $round: ['$commission', 0] }
          }
        },
        {
          $sort: { totalBooking: -1 }
        }
      ]);

      const getUserStatsByMonth = await Booking.aggregate([
        {
          $match: {
            isConfirmed: true,
            createdAt: { $gte: startDate, $lt: endDate }
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$userId', '$$userId'] } } }
            ],
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$userId',
            userId: { $first: '$userId' },
            userName: { $first: '$user.fullname' },
            totalBooking: { $sum: 1 },
            totalPrice: { $sum: { $toDouble: '$price' } }
          }
        },
        {
          $match: {
            totalBooking: { $gt: 0 },
            totalPrice: { $gt: 0 }
          }
        },
        {
          $project: {
            _id: 0, // Ẩn đi _id
            userId: 1,
            userName: 1,
            totalBooking: 1,
            totalPrice: 1
          }
        },
        {
          $sort: { totalBooking: -1 }
        }
      ]);

      resolve({
        status: "OK",
        message: "Success",
        hotel: getHotelStatsByMonth,
        user: getUserStatsByMonth,
        statusCode: 200
      });
    } catch (e) {
      reject(e);
    }
  });
}

const adminAvatar = (headers) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
      const checkUser = await User.findOne({
        userId: decoded.userId
      })
      if (checkUser === null) {
        return resolve({
          status: 'ERR',
          message: 'User không xác định',
          statusCode: 404
        })
      }

      resolve({
        status: 'OK',
        message: 'Success',
        data: checkUser.image,
        statusCode: 200
      })

    } catch (e) {
      reject(e)
    }
  })
}

export default {
  adminHomePage,
  adminAvatar
}