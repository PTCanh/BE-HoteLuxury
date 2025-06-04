import User from '../models/User.js'
import Booking from '../models/Booking.js'
import RoomType from '../models/RoomType.js'
import Hotel from '../models/Hotel.js'
import Schedule from '../models/Schedule.js'
import Room from '../models/Room.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generalAccessToken, generalRefreshToken, generalResetPasswordToken, generalOTPToken } from './JwtService.js'
import dotenv from 'dotenv'
import sendMail from '../utils/SendMail.js'
dotenv.config()

export const createUserService = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { fullname, email, password, roleId, phoneNumber, birthDate, gender, address, image } = newUser
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser !== null) {
                return resolve({
                    status: 'ERR3',
                    message: 'Email đã tồn tại!',
                    statusCode: 404
                })
            }
            const hash = bcrypt.hashSync(password, 10)
            const createdUser = await User.create({
                fullname,
                email,
                password: hash,
                phoneNumber,
                birthDate,
                roleId,
                gender,
                address,
                image,
                isVerified: true
            })
            if (createdUser) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdUser,
                    statusCode: 200
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

export const loginUserService = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Email không tồn tại',
                    statusCode: 404
                })
            } else {
                if (!checkUser.isVerified) {
                    return resolve({
                        status: 'ERR',
                        message: 'Email chưa được xác thực',
                        statusCode: 404
                    })
                }
                if (!checkUser.isConfirmed) {
                    return resolve({
                        status: 'ERR',
                        message: 'Email chưa được xác nhận',
                        statusCode: 404
                    })
                }
                if (!checkUser.active) {
                    return resolve({
                        status: 'ERR',
                        message: 'Tài khoản đã bị khóa',
                        statusCode: 404
                    })
                }
            }
            const comparePassword = bcrypt.compareSync(password, checkUser.password)
            if (!comparePassword) {
                return resolve({
                    status: 'ERR',
                    message: 'Tài khoản hoặc mật khẩu không chính xác',
                    errors: [{
                        field: "password",
                        message: "Tài khoản hoặc mật khẩu không chính xác"
                    }],
                    statusCode: 422
                })
            }

            const access_token = await generalAccessToken({
                userId: checkUser.userId,
                roleId: checkUser.roleId
            })

            const refresh_token = await generalRefreshToken({
                userId: checkUser.userId,
                roleId: checkUser.roleId
            })
            const hashedToken = bcrypt.hashSync(refresh_token, 10)
            await User.findOneAndUpdate({ email: email },
                { refreshToken: hashedToken },
                { new: true }
            )

            if (checkUser.roleId === 'R2') {
                const checkHotel = await Hotel.findOne({ userId: checkUser.userId })

                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    access_token,
                    refresh_token,
                    roleId: checkUser.roleId,
                    userId: checkUser.userId,
                    fullname: checkUser.fullname,
                    avatar: checkUser.image,
                    email: checkUser.email,
                    hotelId: checkHotel.hotelId,
                    statusCode: 200
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token,
                roleId: checkUser.roleId,
                userId: checkUser.userId,
                fullname: checkUser.fullname,
                avatar: checkUser.image,
                email: checkUser.email,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const resetUserPasswordService = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkEmail = await User.findOne({
                email: email
            })
            if (checkEmail === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Email không tồn tại',
                    statusCode: 404
                })
            }

            // Create reset password token
            const token = await generalResetPasswordToken(email);
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            // Create reset password link
            const resetLink = `${process.env.WEB_LINK}/user/reset-password/${token}`;
            // Create text
            //const text = `Click the link to reset your password: https://hoteluxury.vercel.app/newpassword`
            //const text = `Click the link to reset your password: http://localhost:3000/newpassword`
            const text = `OTP để khôi phục mật khẩu của bạn là: ${decoded.otp}. Nó có hiệu lực trong 15 phút.`
            const subject = 'Khôi phục mật khẩu'
            sendMail(email, text, subject)

            resolve({
                status: 'OK',
                message: 'OTP khôi phục mật khẩu đã được gửi đến email của bạn',
                data: token,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const updateUserService = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                userId: id
            })
            if (checkUser === null) {
                return resolve({
                    status: 'ERR',
                    message: 'User không tồn tại',
                    statusCode: 404
                })
            }
            if (data.password) {
                data.password = bcrypt.hashSync(data.password, 10)
            }
            if (data.isConfirmed === true) {
                const text = 'Tài khoản của bạn đã được xác nhận.'
                const subject = 'Xác nhận tài khoản'
                sendMail(checkUser.email, text, subject)
            }
            const updatedUser = await User.findOneAndUpdate(
                { userId: id },  // Điều kiện tìm kiếm
                data,  // Giá trị cần cập nhật
                { new: true }
            )
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedUser,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const deleteUserService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                userId: id
            })
            if (checkUser === null) {
                return resolve({
                    status: 'ERR',
                    message: 'User không tồn tại',
                    statusCode: 404
                })
            }

            await User.findOneAndDelete({ userId: id })
            resolve({
                status: 'OK',
                message: 'Xóa user thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const getAllUserService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUsers = await User.find({
                roleId: "R3"
            })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUsers
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const getDetailsUserService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({
                userId: id
            }).lean()
            if (user.birthDate) {
                user.birthDate = user.birthDate.toISOString().split('T')[0]
            }
            // const formatedUser = {
            //     ...user,
            //     birthDate: user.birthDate.toISOString().split('T')[0]
            // }
            if (user === null) {
                return resolve({
                    status: 'ERR',
                    message: 'User không tồn tại',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Success',
                data: user,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
            console.log(e)
        }
    })
}

export const filterUserService = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const formatFilter = {}
            if (filter.email) {
                formatFilter.email = filter.email.replace(/\s+/g, ' ').trim()
                formatFilter.email = { $regex: new RegExp(formatFilter.email, 'i') } // Không phân biệt hoa thường
            }
            if (filter.fullname) {
                formatFilter.fullname = filter.fullname.replace(/\s+/g, ' ').trim()
                formatFilter.fullname = { $regex: new RegExp(formatFilter.fullname, 'i') } // Không phân biệt hoa thường
            }
            if (filter.phoneNumber) {
                formatFilter.phoneNumber = filter.phoneNumber.replace(/\s+/g, ' ').trim()
                formatFilter.phoneNumber = { $regex: new RegExp(formatFilter.phoneNumber) }
            }
            if (filter.roleId) {
                formatFilter.roleId = filter.roleId.replace(/\s+/g, ' ').trim()
                formatFilter.roleId = { $regex: new RegExp(formatFilter.roleId, 'i') }
            }
            if (filter.birthDate) {
                formatFilter.birthDate = filter.birthDate
            }
            const filterUser = await User.find(formatFilter);
            if (filterUser.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `Không tìm thấy user nào`,
                    statusCode: 404
                })
            }
            resolve({
                status: 'OK',
                message: 'Lọc user thành công',
                data: filterUser,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const getAllHotelManagerService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUsers = await User.find({
                roleId: "R2",
                isConfirmed: true
            })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUsers
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const getAllPendingHotelManagerService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUsers = await User.find({
                roleId: "R2",
                isConfirmed: false
            })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUsers
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const updatePassword = async (userId, oldPassword, newPassword, confirmPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm người dùng theo userId
            const user = await User.findOne({ userId: userId });
            if (!user) {
                return resolve({
                    status: "ERR",
                    message: "Không tìm thấy user",
                    errors: [{
                        field: "",
                        message: ""
                    }],
                    statusCode: 404
                });
            }

            // Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return resolve({
                    status: "ERR1",
                    message: "Mật khẩu cũ không đúng",
                    errors: [{
                        field: "oldPassword",
                        message: "Mật khẩu cũ không đúng"
                    }],
                    statusCode: 422
                });
            }

            // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
            if (newPassword !== confirmPassword) {
                return resolve({
                    status: "ERR2",
                    message: "Mật khẩu mới và xác nhận mật khẩu không giống nhau",
                    errors: [{
                        field: "confirmPassword",
                        message: "Mật khẩu mới và xác nhận mật khẩu không giống nhau"
                    }],
                    statusCode: 422
                });
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Cập nhật mật khẩu mới
            user.password = hashedPassword;
            await user.save();

            resolve({
                status: "OK",
                message: "Cập nhật mật khẩu thành công",
                statusCode: 200
            });
        } catch (e) {
            reject({
                status: "ERR",
                message: "Lỗi server",
                statusCode: 500
            });
        }
    });
};

export const hotelManagerDashboardService = (headers, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!filter.filterStart || !filter.filterEnd) {
                return resolve({
                    status: 'ERR1',
                    message: 'Không có filter',
                    statusCode: 400
                })
            }
            const filterStart = new Date(filter.filterStart)
            const filterEnd = new Date(filter.filterEnd)
            if (isNaN(filterStart) || isNaN(filterEnd)) {
                return resolve({
                    status: 'ERR2',
                    message: 'filter không hợp lệ',
                    statusCode: 400
                })
            }
            const year = new Date().getFullYear()
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            const checkHotel = await Hotel.findOne({ userId: decoded.userId, isDeleted: false })
            const checkRoomType = await RoomType.find({ hotelId: checkHotel.hotelId })
            const checkRoomTypeIds = checkRoomType.map(roomType => roomType.roomTypeId)
            const totalCancelledBookingOfHotel = await Booking.countDocuments({
                roomTypeId: { $in: checkRoomTypeIds },
                status: { $in: ["Đã hủy", "Đã hết phòng"] },
                createdAt: { $gte: filterStart, $lte: filterEnd }
            })
            const totalBookingOfHotel = await Booking.countDocuments({
                roomTypeId: { $in: checkRoomTypeIds },
                status: { $in: ["Chưa thanh toán", "Đã thanh toán"] },
                isConfirmed: true,
                createdAt: { $gte: filterStart, $lte: filterEnd }
            })
            const totalBookingsByRoomType = await Booking.aggregate([
                {
                    $match: {
                        status: { $in: ["Chưa thanh toán", "Đã thanh toán"] },
                        roomTypeId: { $in: checkRoomTypeIds },  // Thêm điều kiện lọc roomTypeId
                        isConfirmed: true,
                        createdAt: {
                            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                        }
                    }
                },
                {
                    $addFields: {
                        month: { $month: "$createdAt" }
                    }
                },
                {
                    $group: {
                        _id: {
                            roomTypeId: "$roomTypeId",
                            month: "$month"
                        },
                        totalBookings: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: "roomtypes", // Tên collection RoomType
                        localField: "_id.roomTypeId", // roomTypeId từ bước nhóm
                        foreignField: "roomTypeId", // Khóa liên kết trong RoomType
                        as: "roomTypeInfo" // Kết quả gán vào trường này
                    }
                },
                {
                    $unwind: "$roomTypeInfo"
                },
                {
                    $project: {
                        roomTypeId: "$_id.roomTypeId",
                        roomTypeName: "$roomTypeInfo.roomTypeName",
                        month: "$_id.month",
                        totalBookings: 1,
                        _id: 0 // Loại bỏ _id gốc nếu không cần
                    }
                },
                {
                    $sort: { roomTypeId: 1, month: 1 }
                }
            ]);

            const fullYearBookingByRoomType = [];

            const roomTypeGroups = {};

            for (const item of totalBookingsByRoomType) {
                const key = item.roomTypeId;
                if (!roomTypeGroups[key]) roomTypeGroups[key] = [];
                roomTypeGroups[key].push(item);
            }

            for (const roomTypeId in roomTypeGroups) {
                const monthlyData = roomTypeGroups[roomTypeId];

                for (let i = 1; i <= 12; i++) {
                    const found = monthlyData.find(c => c.month === i);
                    fullYearBookingByRoomType.push({
                        roomTypeId,
                        roomTypeName: found ? found.roomTypeName : monthlyData[0].roomTypeName,
                        month: i,
                        totalBookings: found ? found.totalBookings : 0
                    });
                }
            }

            const totalBookingOfHotelByTime = await Booking.aggregate([
                // Bước 1: Lọc các booking hợp lệ
                {
                    $match: {
                        roomTypeId: { $in: checkRoomTypeIds },
                        status: { $in: ["Chưa thanh toán", "Đã thanh toán"] },
                        isConfirmed: true,
                        createdAt: {
                            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                        }
                    }
                },
                // Bước 2: Nhóm theo ngày, tuần, tháng, năm
                {
                    $project: {
                        dayStart: 1, // Giữ lại ngày bắt đầu của booking
                        roomTypeId: 1
                    }
                },
                // Bước 3: Nhóm theo các đơn vị thời gian (Ngày, Tuần, Tháng, Năm)
                {
                    $group: {
                        _id: {
                            ...(filter.time === "ngày" && {
                                day: {
                                    $dateToString: {
                                        format: "%Y-%m-%d", // Định dạng "yyyy-mm-dd"
                                        date: "$dayStart"
                                    }
                                }
                            }),
                            ...(filter.time === "tuần" && {
                                week: {
                                    $isoWeek: "$dayStart" // Sử dụng $isoWeek để lấy số tuần trong năm
                                }
                            }),
                            ...(filter.time === "tháng" && { month: { $month: "$dayStart" } }),
                            ...(filter.time === "năm" && { year: { $year: "$dayStart" } })
                        },
                        totalBookings: { $sum: 1 } // Tính tổng số lượt đặt cho mỗi nhóm thời gian
                    }
                },
                // Bước 4: Sắp xếp kết quả theo ngày bắt đầu của booking
                {
                    $sort: {
                        "_id.year": 1,  // Sắp xếp theo năm tăng dần
                        "_id.month": 1, // Sắp xếp theo tháng tăng dần
                        "_id.week": 1,  // Sắp xếp theo tuần
                        "_id.day": 1    // Sắp xếp theo ngày
                    }
                }
            ]);

            const fullYearToTalBooking = [];
            for (let i = 1; i <= 12; i++) {
                const found = totalBookingOfHotelByTime.find(c => c._id.month === i);
                fullYearToTalBooking.push({
                    _id: { month: i },
                    totalBookings: found ? found.totalBookings : 0
                });
            }

            const totalRevenueOfHotelByTime = await Booking.aggregate([
                // Bước 1: Lọc các booking hợp lệ
                {
                    $match: {
                        roomTypeId: { $in: checkRoomTypeIds },
                        status: { $in: ["Chưa thanh toán", "Đã thanh toán"] },
                        isConfirmed: true,
                        dayEnd: {
                            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                        }
                    }
                },
                // Bước 2: Nhóm theo ngày, tuần, tháng, năm
                {
                    $project: {
                        dayStart: 1, // Giữ lại ngày bắt đầu của booking
                        price: { $toDouble: "$price" },
                        roomTypeId: 1
                    }
                },
                // Bước 3: Nhóm theo các đơn vị thời gian (Ngày, Tuần, Tháng, Năm)
                {
                    $group: {
                        _id: {
                            ...(filter.time === "ngày" && {
                                day: {
                                    $dateToString: {
                                        format: "%Y-%m-%d", // Định dạng "yyyy-mm-dd"
                                        date: "$dayStart"
                                    }
                                }
                            }),
                            ...(filter.time === "tuần" && {
                                week: {
                                    $isoWeek: "$dayStart" // Sử dụng $isoWeek để lấy số tuần trong năm
                                }
                            }),
                            ...(filter.time === "tháng" && { month: { $month: "$dayStart" } }),
                            ...(filter.time === "năm" && { year: { $year: "$dayStart" } })
                        },
                        totalRevenue: {
                            $sum: "$price"
                        }
                    }
                },
                // Bước 4: Sắp xếp kết quả theo ngày bắt đầu của booking
                {
                    $sort: {
                        "_id.year": 1,  // Sắp xếp theo năm tăng dần
                        "_id.month": 1, // Sắp xếp theo tháng tăng dần
                        "_id.week": 1,  // Sắp xếp theo tuần
                        "_id.day": 1    // Sắp xếp theo ngày
                    }
                }
            ]);

            const fullYearRevenue = [];
            for (let i = 1; i <= 12; i++) {
                const found = totalRevenueOfHotelByTime.find(c => c._id.month === i);
                fullYearRevenue.push({
                    _id: { month: i },
                    totalRevenue: found ? found.totalRevenue : 0
                });
            }

            const top10BookingUser = await Booking.aggregate([
                // Bước 1: Lọc các booking có status hợp lệ
                {
                    $match: {
                        status: { $in: ["Chưa thanh toán", "Đã thanh toán"] },
                        isConfirmed: true,
                        roomTypeId: { $in: checkRoomTypeIds }  // Thêm điều kiện lọc roomTypeId
                    }
                },
                // Bước 2: Nhóm theo userId và đếm số lượng
                {
                    $group: {
                        _id: "$userId", // Nhóm theo userId
                        totalBookings: { $sum: 1 }, // Đếm số lượng mỗi roomTypeId
                        totalPrice: { $sum: { $toDouble: '$price' } }
                    }
                },
                // Bước 3: Sắp xếp các user theo tổng số lượt đặt (từ cao xuống thấp)
                {
                    $sort: { totalBookings: -1 }  // Sắp xếp theo totalBookings giảm dần
                },
                // Bước 4: Nối qua User để lấy thông tin fullname
                {
                    $lookup: {
                        from: "users", // Tên collection RoomType
                        localField: "_id", // roomTypeId từ bước nhóm
                        foreignField: "userId", // Khóa liên kết trong RoomType
                        as: "userInfo" // Kết quả gán vào trường này
                    }
                },
                // Bước 5: Giải nén userInfo (nếu cần, vì lookup trả về mảng)
                {
                    $unwind: "$userInfo"
                },
                // Bước 6: Chọn các trường cần thiết
                {
                    $project: {
                        userId: "$_id",
                        totalBookings: 1,
                        totalPrice: 1,
                        fullname: "$userInfo.fullname",
                        phoneNumber: "$userInfo.phoneNumber",
                        email: "$userInfo.email",
                        address: "$userInfo.address",
                        image: "$userInfo.image",
                        birthDate: "$userInfo.birthDate",
                        _id: 0 // Loại bỏ _id gốc nếu không cần
                    }
                },
                { $limit: 10 }
            ]);

            const totalMoneyFilterResult = await Booking.aggregate([
                {
                    $match: {
                        status: { $in: ["Chưa thanh toán", "Đã thanh toán"] },
                        isConfirmed: true,
                        roomTypeId: { $in: checkRoomTypeIds },  // Thêm điều kiện lọc roomTypeId
                        dayEnd: { $gte: filterStart, $lte: filterEnd }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalBooking: { $sum: 1 },
                        totalPrice: { $sum: { $toDouble: '$price' } },
                        totalFinalPrice: { $sum: { $toDouble: '$finalPrice' } }
                    }
                },
                {
                    $addFields: {
                        totalCommission: {
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
                        totalBooking: 1,
                        totalPrice: 1,
                        totalFinalPrice: 1,
                        totalCommission: { $round: ['$totalCommission', 0] },
                        totalMoney: 1
                    }
                },
                {
                    $sort: { totalBookings: -1 }  // Sắp xếp theo totalBookings giảm dần
                }
            ])

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                totalMoneyFilterResult,
                ratingQuantity: checkHotel.ratingQuantity,
                ratingAverage: checkHotel.ratingAverage,
                totalBookingOfHotel: totalBookingOfHotel,
                totalCancelledBookingOfHotel: totalCancelledBookingOfHotel,
                totalBookingsByRoomType: fullYearBookingByRoomType,
                totalBookingOfHotelByTime: fullYearToTalBooking,
                totalRevenueOfHotelByTime: fullYearRevenue,
                top10BookingUser: top10BookingUser
            })

        } catch (e) {
            reject(e)
            console.log(e)
        }
    })
}

export const googleLoginUserService = (googleLogin) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkUser = await User.findOne({
                email: googleLogin.email
            })
            if (checkUser === null) {
                const hash = bcrypt.hashSync(googleLogin.sub, 10)
                checkUser = await User.create({
                    email: googleLogin.email,
                    password: hash,
                    fullname: googleLogin.name,
                    image: googleLogin.picture,
                    isVerified: true
                })
            } else {
                if (!checkUser.isVerified) {
                    return resolve({
                        status: 'ERR',
                        message: 'Email chưa được xác thực',
                        statusCode: 404
                    })
                }
                if (!checkUser.isConfirmed) {
                    return resolve({
                        status: 'ERR',
                        message: 'Email chưa được xác nhận',
                        statusCode: 404
                    })
                }
                if (!checkUser.active) {
                    return resolve({
                        status: 'ERR',
                        message: 'Tài khoản đã bị khóa',
                        statusCode: 404
                    })
                }
            }

            const access_token = await generalAccessToken({
                userId: checkUser.userId,
                roleId: checkUser.roleId
            })

            const refresh_token = await generalRefreshToken({
                userId: checkUser.userId,
                roleId: checkUser.roleId
            })
            const hashedToken = bcrypt.hashSync(refresh_token, 10)
            await User.findOneAndUpdate({ email: googleLogin.email },
                { refreshToken: hashedToken },
                { new: true }
            )

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token,
                roleId: checkUser.roleId,
                userId: checkUser.userId,
                fullname: checkUser.fullname,
                avatar: checkUser.image,
                email: checkUser.email
            })

        } catch (e) {
            reject(e)
        }
    })
}