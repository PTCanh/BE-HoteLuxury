import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import jwt from 'jsonwebtoken'

const adminHomePage = async () => {
  return new Promise(async (resolve, reject) => {
    const today = new Date();

    const currentYear = today.getFullYear(); // Lấy năm hiện tại
    const currentMonth = today.getMonth(); // Lấy tháng hiện tại (0-11)

    // Ngày đầu tiên của tháng hiện tại
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    // Ngày đầu tiên của tháng tiếp theo (để xác định khoảng thời gian của tháng hiện tại)
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    try {
      // đếm tổng số người dùng mới
      const countOfNewUserThisMonth = await User.countDocuments({
        isVerified: true,  // Điều kiện isVerified = true
        createdAt: {        // Điều kiện createdAt nằm trong tháng hiện tại
          $gte: startOfMonth,  // Lớn hơn hoặc bằng ngày đầu tiên của tháng
          $lt: startOfNextMonth // Nhỏ hơn ngày đầu tiên của tháng tiếp theo
        }
      });

      // Đếm tổng số khách sạn
      const totalHotels = await Hotel.countDocuments();

      // Đếm tổng số lượt đặt khám bệnh trong tháng
      const totalBookingThisMonth = await Booking.countDocuments({
        dayStart: {        // Điều kiện createdAt nằm trong tháng hiện tại
          $gte: startOfMonth,  // Lớn hơn hoặc bằng ngày đầu tiên của tháng
          $lt: startOfNextMonth // Nhỏ hơn ngày đầu tiên của tháng tiếp theo
        }
      });

      // Tính tổng doanh thu tháng hiện tại
      const revenueThisMonth = await Booking.aggregate([
        {
          // Lọc các booking có dayStart trong tháng hiện tại
          $match: {
            dayStart: {
              $gte: startOfMonth,  // Ngày lớn hơn hoặc bằng ngày đầu tháng
              $lt: startOfNextMonth // Ngày nhỏ hơn ngày đầu tháng tiếp theo
            }
          }
        },
        {
          // Nối với collection RoomType dựa trên roomTypeId
          $lookup: {
            from: "RoomType",          // Tên collection RoomType
            localField: "roomTypeId",  // Trường liên kết từ Booking
            foreignField: "roomTypeId",       // Trường liên kết từ RoomType
            as: "roomTypeInfo"         // Tên trường để lưu thông tin RoomType
          }
        },
        {
          // Tính toán tổng giá tiền của từng booking
          $project: {
            roomQuantity: 1,  // Số lượng phòng
            roomTypeInfo: { $arrayElemAt: ["$roomTypeInfo", 0] }, // Lấy phần tử đầu tiên của roomTypeInfo
            totalBookingRevenue: {
              $multiply: [
                { $toDouble: "$roomQuantity" },          // Chuyển số lượng phòng sang số
                { $toDouble: "$roomTypeInfo.roomTypePrice" } // Chuyển giá tiền phòng sang số
              ]
            }
          }
        },
        {
          // Tổng hợp tất cả doanh thu từ các booking
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalBookingRevenue" } // Tổng doanh thu
          }
        }
      ]);

      // Tính tổng doanh thu từng tháng trong năm
      const revenueEachMonth = await Booking.aggregate([
        {
          // Lọc các booking trong năm hiện tại
          $match: {
            dayStart: {
              $gte: new Date(currentYear, 0, 1),  // Ngày đầu tiên của năm (1/1)
              $lt: new Date(currentYear + 1, 0, 1) // Ngày đầu tiên của năm tiếp theo
            }
          }
        },
        {
          // Nối với collection RoomType dựa trên roomTypeId
          $lookup: {
            from: "RoomType",          // Tên collection RoomType
            localField: "roomTypeId",  // Trường liên kết từ Booking
            foreignField: "_id",       // Trường liên kết từ RoomType
            as: "roomTypeInfo"         // Tên trường để lưu thông tin RoomType
          }
        },
        {
          // Tính toán tổng giá tiền của từng booking
          $project: {
            month: { $month: "$dayStart" }, // Lấy tháng từ trường dayStart
            roomQuantity: 1,                // Số lượng phòng
            roomTypeInfo: { $arrayElemAt: ["$roomTypeInfo", 0] }, // Lấy phần tử đầu tiên của roomTypeInfo
            totalBookingRevenue: {
              $multiply: [
                { $toDouble: "$roomQuantity" },            // Chuyển số lượng phòng sang số
                { $toDouble: "$roomTypeInfo.roomTypePrice" } // Chuyển giá tiền phòng sang số
              ]
            }
          }
        },
        {
          // Nhóm các booking theo tháng và tính tổng doanh thu cho từng tháng
          $group: {
            _id: "$month",                           // Nhóm theo tháng
            totalRevenue: { $sum: "$totalBookingRevenue" } // Tổng doanh thu của từng tháng
          }
        },
        {
          // Sắp xếp kết quả theo thứ tự tháng
          $sort: { "_id": 1 } // Sắp xếp tháng theo thứ tự từ 1 đến 12
        }
      ]);

      resolve({
        status: "OK",
        message: "Success",
        countOfNewUserThisMonth: countOfNewUserThisMonth,
        totalHotels: totalHotels,
        totalBookingThisMonth: totalBookingThisMonth,
        revenueThisMonth: revenueThisMonth.length ? revenueThisMonth[0].totalRevenue : 0,
        revenueEachMonth: revenueEachMonth,
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
          message: 'The user is not defined',
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