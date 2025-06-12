import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import Voucher from "../models/Voucher.js";
import jwt from 'jsonwebtoken'

const adminHomePage = async (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!query.filterStart || !query.filterEnd) {
        return resolve({
          status: 'ERR1',
          message: 'Không có filter',
          statusCode: 400
        })
      }
      const filterStart = new Date(query.filterStart)
      const filterEnd = new Date(query.filterEnd)
      if (isNaN(filterStart) || isNaN(filterEnd)) {
        return resolve({
          status: 'ERR2',
          message: 'filter không hợp lệ',
          statusCode: 400
        })
      }

      const totalHotel = await Hotel.countDocuments({ isDeleted: false })

      const totalNewUser = await User.countDocuments({
        createdAt: { $gte: filterStart, $lte: filterEnd }
      })

      const totalCommissionResult = await Booking.aggregate([
        {
          $match: {
            status: { $in: ['Đã thanh toán', 'Chưa thanh toán'] },
            isConfirmed: true,
            dayEnd: { $gte: filterStart, $lte: filterEnd }
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
          $group: {
            _id: '$roomType.hotelId',
            totalBooking: { $sum: 1 },
            totalPrice: { $sum: { $toDouble: '$price' } },
            totalFinalPrice: { $sum: { $toDouble: '$finalPrice' } }
          }
        },
        {
          $addFields: {
            commission: {
              $cond: [
                { $and: [{ $gte: ['$totalBooking', 5] }, { $gte: ['$totalPrice', 20000000] }] },
                { $multiply: ['$totalPrice', 0.08] },
                {
                  $cond: [
                    { $gte: ['$totalBooking', 5] },
                    { $multiply: ['$totalPrice', 0.06] },
                    { $multiply: ['$totalPrice', 0.04] }
                  ]
                }
              ]
            },
            money: {
              $subtract: [
                {
                  $cond: [
                    { $and: [{ $gte: ['$totalBooking', 5] }, { $gte: ['$totalPrice', 20000000] }] },
                    { $multiply: ['$totalPrice', 0.08] },
                    {
                      $cond: [
                        { $gte: ['$totalBooking', 5] },
                        { $multiply: ['$totalPrice', 0.06] },
                        { $multiply: ['$totalPrice', 0.04] }
                      ]
                    }
                  ]
                },
                { $subtract: ['$totalPrice', '$totalFinalPrice'] }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalCommission: { $sum: '$commission' },
            totalMoney: { $sum: '$money' }
          }
        },
        {
          $project: {
            _id: 0,
            totalCommission: { $round: ['$totalCommission', 0] },
            totalMoney: 1
          }
        }
      ])

      const year = new Date().getFullYear()

      const totalCommissionByMonth = await Booking.aggregate([
        {
          $match: {
            status: { $in: ['Đã thanh toán', 'Chưa thanh toán'] },
            isConfirmed: true,
            dayEnd: {
              $gte: new Date(`${year}-01-01T00:00:00.000Z`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            }
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
          $addFields: {
            year: { $year: '$dayEnd' },
            month: { $month: '$dayEnd' }
          }
        },
        {
          $group: {
            _id: { year: '$year', month: '$month', hotelId: '$roomType.hotelId' },
            totalBooking: { $sum: 1 },
            totalPrice: { $sum: { $toDouble: '$price' } }
          }
        },
        {
          $addFields: {
            commission: {
              $cond: [
                { $and: [{ $gte: ['$totalBooking', 5] }, { $gte: ['$totalPrice', 20000000] }] },
                { $multiply: ['$totalPrice', 0.08] },
                {
                  $cond: [
                    { $gte: ['$totalBooking', 5] },
                    { $multiply: ['$totalPrice', 0.06] },
                    { $multiply: ['$totalPrice', 0.04] }
                  ]
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: { year: '$_id.year', month: '$_id.month' },
            totalCommission: { $sum: '$commission' }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            totalCommission: { $round: ['$totalCommission', 0] }
          }
        },
        { $sort: { year: 1, month: 1 } }
      ])


      const getHotelStatsByFilter = await Booking.aggregate([
        {
          $match: {
            isConfirmed: true,
            status: { $in: ['Đã thanh toán', 'Chưa thanh toán'] },
            dayEnd: { $gte: filterStart, $lte: filterEnd }
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
            totalPrice: { $sum: { $toDouble: '$price' } },
            totalFinalPrice: { $sum: { $toDouble: '$finalPrice' } }
          }
        },
        {
          $addFields: {
            commission: {
              $cond: [
                { $and: [{ $gte: ['$totalBooking', 5] }, { $gte: ['$totalPrice', 20000000] }] },
                { $multiply: ['$totalPrice', 0.08] },
                {
                  $cond: [
                    { $gte: ['$totalBooking', 5] },
                    { $multiply: ['$totalPrice', 0.06] },
                    { $multiply: ['$totalPrice', 0.04] }
                  ]
                }
              ]
            },
            totalMoney: {
              $subtract: [
                {
                  $cond: [
                    { $and: [{ $gte: ['$totalBooking', 5] }, { $gte: ['$totalPrice', 20000000] }] },
                    { $multiply: ['$totalPrice', 0.08] },
                    {
                      $cond: [
                        { $gte: ['$totalBooking', 5] },
                        { $multiply: ['$totalPrice', 0.06] },
                        { $multiply: ['$totalPrice', 0.04] }
                      ]
                    }
                  ]
                },
                { $subtract: ['$totalPrice', '$totalFinalPrice'] }
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
            totalFinalPrice: 1,
            commission: { $round: ['$commission', 0] },
            totalMoney: 1
          }
        },
        {
          $sort: { totalBooking: -1, totalPrice: -1 }
        },
        { $limit: 10 }
      ]);

      const getUserStatsByFilter = await Booking.aggregate([
        {
          $match: {
            isConfirmed: true,
            status: { $in: ["Chưa thanh toán", "Đã thanh toán"] },
            createdAt: { $gte: filterStart, $lte: filterEnd }
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
            email: { $first: '$user.email' },
            phoneNumber: { $first: '$user.phoneNumber' },
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
            email: 1,
            phoneNumber: 1,
            totalBooking: 1,
            totalPrice: 1
          }
        },
        {
          $sort: { totalBooking: -1, totalPrice: -1 }
        },
        { $limit: 10 }
      ]);

      const fullYearCommission = [];
      for (let i = 1; i <= 12; i++) {
        const found = totalCommissionByMonth.find(c => c.month === i);
        fullYearCommission.push({
          month: i,
          totalCommission: found ? found.totalCommission : 0
        });
      }


      resolve({
        status: "OK",
        message: "Success",
        totalHotel: totalHotel,
        totalNewUser: totalNewUser,
        totalCommission: totalCommissionResult[0]?.totalCommission || 0,
        totalMoney: totalCommissionResult[0]?.totalMoney || 0,
        hotel: getHotelStatsByFilter,
        user: getUserStatsByFilter,
        totalCommissionByMonth: fullYearCommission,
        statusCode: 200
      });
    } catch (e) {
      reject(e);
      console.log(e)
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

const getAllHotel = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!query.filterStart || !query.filterEnd) {
        return resolve({
          status: 'ERR1',
          message: 'Không có filter',
          statusCode: 400
        })
      }
      const filterStart = new Date(query.filterStart)
      const filterEnd = new Date(query.filterEnd)
      if (isNaN(filterStart) || isNaN(filterEnd)) {
        return resolve({
          status: 'ERR2',
          message: 'filter không hợp lệ',
          statusCode: 400
        })
      }
      let getHotelStatsByFilter = await Booking.aggregate([
        {
          $match: {
            isConfirmed: true,
            status: { $in: ['Đã thanh toán', 'Chưa thanh toán'] },
            dayEnd: { $gte: filterStart, $lte: filterEnd }
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
          $lookup: {
            from: 'locations',
            let: { locationId: '$hotel.locationId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$locationId', '$$locationId'] } } }
            ],
            as: 'location'
          }
        },
        { $unwind: '$location' },
        {
          $group: {
            _id: '$roomType.hotelId',
            hotelId: { $first: '$roomType.hotelId' },
            hotelName: { $first: '$hotel.hotelName' },
            locationName: { $first: '$location.locationName' },
            totalBooking: { $sum: 1 },
            totalPrice: { $sum: { $toDouble: '$price' } },
            totalFinalPrice: { $sum: { $toDouble: '$finalPrice' } },
            isDeleted: { $first: '$hotel.isDeleted' }
          }
        },
        {
          $addFields: {
            commission: {
              $cond: [
                { $and: [{ $gte: ['$totalBooking', 5] }, { $gte: ['$totalPrice', 20000000] }] },
                { $multiply: ['$totalPrice', 0.08] },
                {
                  $cond: [
                    { $gte: ['$totalBooking', 5] },
                    { $multiply: ['$totalPrice', 0.06] },
                    { $multiply: ['$totalPrice', 0.04] }
                  ]
                }
              ]
            },
            totalMoney: {
              $subtract: [
                {
                  $cond: [
                    { $and: [{ $gte: ['$totalBooking', 5] }, { $gte: ['$totalPrice', 20000000] }] },
                    { $multiply: ['$totalPrice', 0.08] },
                    {
                      $cond: [
                        { $gte: ['$totalBooking', 5] },
                        { $multiply: ['$totalPrice', 0.06] },
                        { $multiply: ['$totalPrice', 0.04] }
                      ]
                    }
                  ]
                },
                { $subtract: ['$totalPrice', '$totalFinalPrice'] }
              ]
            }
          }
        },
        {
          $project: {
            _id: 0,
            hotelId: 1,
            hotelName: 1,
            locationName: 1,
            totalBooking: 1,
            totalPrice: 1,
            totalFinalPrice: 1,
            commission: { $round: ['$commission', 0] },
            totalMoney: 1,
            isDeleted: 1
          }
        },
        {
          $sort: { totalBooking: -1, totalPrice: -1 }
        }
      ]);

      const hotelIds = getHotelStatsByFilter.map(hotel => hotel.hotelId)
      let otherHotels = await Hotel.find({
        hotelId: { $nin: hotelIds }
      }).populate({
        path: "locationId",
        model: "Location",
        localField: "locationId",
        foreignField: "locationId",
        select: "locationName",
      }).lean()
      otherHotels = otherHotels.map(hotel => {
        return {
          hotelId: hotel.hotelId,
          hotelName: hotel.hotelName,
          locationName: hotel.locationId?.locationName || null,
          totalBooking: 0,
          totalPrice: 0,
          totalFinalPrice: 0,
          commission: 0,
          totalMoney: 0,
          isDeleted: hotel.isDeleted
        }
      })
      let mergedArray = [...getHotelStatsByFilter, ...otherHotels];

      const filterHotelName = query.hotelName?.toLowerCase().trim()
      const filterLocationName = query.locationName?.toLowerCase().trim()

      if (filterHotelName) {
        mergedArray = mergedArray.filter(hotel => hotel.hotelName.toLowerCase().includes(filterHotelName));
      }
      if (filterLocationName) {
        mergedArray = mergedArray.filter(hotel => hotel.locationName.toLowerCase().includes(filterLocationName));
      }

      resolve({
        status: 'OK',
        message: 'Xem danh sách khách sạn thành công',
        data: mergedArray,
        statusCode: 200
      })

    } catch (e) {
      reject(e)
    }
  })
}

const getAllVoucher = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkVoucher = await Voucher.find({
        userId: null
      }).sort({ createdAt: -1 })

      resolve({
        status: 'OK',
        message: 'Xem tất cả Voucher thành công',
        data: checkVoucher,
        statusCode: 200
      })

    } catch (e) {
      reject(e)
    }
  })
}

export default {
  adminHomePage,
  adminAvatar,
  getAllHotel,
  getAllVoucher
}