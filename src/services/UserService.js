import User from '../models/User.js'
import Booking from '../models/Booking.js'
import RoomType from '../models/RoomType.js'
import Hotel from '../models/Hotel.js'
import Schedule from '../models/Schedule.js'
import Room from '../models/Room.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generalAccessToken, generalRefreshToken, generalResetPasswordToken } from './JwtService.js'
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
                    message: 'The email is already exists!'
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
                    data: createdUser
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
                    message: 'The email is not defined'
                })
            } else {
                if (!checkUser.isVerified) {
                    return resolve({
                        status: 'ERR2',
                        message: 'The email is not verified'
                    })
                }
            }
            const comparePassword = bcrypt.compareSync(password, checkUser.password)

            if (!comparePassword) {
                return resolve({
                    status: 'ERR',
                    message: 'The user or password is incorrect',
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

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token,
                roleId: checkUser.roleId,
                userId: checkUser.userId,
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
                    message: 'The email is not defined'
                })
            }

            // Create reset password token
            const token = await generalResetPasswordToken(email);
            // Create reset password link
            const resetLink = `${process.env.WEB_LINK}/user/reset-password/${token}`;
            // Create text
            const text = `Click the link to reset your password: https://hoteluxury.vercel.app/newpassword`
            const subject = 'Reset password'
            sendMail(email, text, subject)

            resolve({
                status: 'OK',
                message: 'Password reset link has been sent to your email',
                data: token
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
                    message: 'The user is not defined'
                })
            }
            if (data.password) {
                data.password = bcrypt.hashSync(data.password, 10)
            }
            const updatedUser = await User.findOneAndUpdate(
                { userId: id },  // Điều kiện tìm kiếm
                data,  // Giá trị cần cập nhật
                { new: true }
            )
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedUser
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
                    message: 'The user is not defined'
                })
            }

            await User.findOneAndDelete({ userId: id })
            resolve({
                status: 'OK',
                message: 'Delete user success',
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const getAllUserService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUsers = await User.find()
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
            if(user.birthDate){
                user.birthDate = user.birthDate.toISOString().split('T')[0]
            }
            // const formatedUser = {
            //     ...user,
            //     birthDate: user.birthDate.toISOString().split('T')[0]
            // }
            if (user === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'Success',
                data: user
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
                    message: `The User is not found`
                })
            }
            resolve({
                status: 'OK',
                message: 'Filter User successfully',
                data: filterUser
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
                roleId: "R2"
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
                    message: "User not found",
                });
            }

            // Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return resolve({
                    status: "ERR1",
                    message: "Mật khẩu cũ không đúng",
                });
            }

            // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
            if (newPassword !== confirmPassword) {
                return resolve({
                    status: "ERR2",
                    message: "New password and confirm password do not match",
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
                message: "Password updated successfully",
            });
        } catch (e) {
            reject({
                status: "ERR",
                message: "Error from server",
                error: e.message,
            });
        }
    });
};

export const hotelManagerDashboardService = (hotelId, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const token = headers.authorization.split(' ')[1]
            // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            // const checkHotel = await Hotel.find({userId:decoded.userId})
            // const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
            const checkHotel = await Hotel.findOne({ hotelId: hotelId})
            const checkRoomType = await RoomType.find({ hotelId: hotelId })
            const checkRoomTypeIds = checkRoomType.map(roomType => roomType.roomTypeId)
            const totalCancelledBookingOfHotel = await Booking.find({
                roomTypeId: { $in: checkRoomTypeIds },
                status: { $in: ["Đã hủy", "Đã hết phòng"] }
            })
            const totalBookingOfHotel = await Booking.find({
                roomTypeId: { $in: checkRoomTypeIds },
                status: { $nin: ["Đã hủy", "Đã hết phòng"], $ne: null }
            })
            const totalBookingsByRoomType = await Booking.aggregate([
                // Bước 1: Lọc các booking có status hợp lệ
                {
                    $match: {
                        status: { $nin: ["Đã hủy", "Đã hết phòng"], $ne: null },
                        roomTypeId: { $in: checkRoomTypeIds }  // Thêm điều kiện lọc roomTypeId
                    }
                },
                // Bước 2: Nhóm theo roomTypeId và đếm số lượng
                {
                    $group: {
                        _id: "$roomTypeId", // Nhóm theo roomTypeId
                        totalBookings: { $sum: 1 } // Đếm số lượng mỗi roomTypeId
                    }
                },
                // Bước 3: Sắp xếp các roomType theo tổng số lượt đặt (từ cao xuống thấp)
                {
                    $sort: { totalBookings: -1 }  // Sắp xếp theo totalBookings giảm dần
                },
                // Bước 4: Nối qua RoomType để lấy thông tin roomTypeName
                {
                    $lookup: {
                        from: "roomtypes", // Tên collection RoomType
                        localField: "_id", // roomTypeId từ bước nhóm
                        foreignField: "roomTypeId", // Khóa liên kết trong RoomType
                        as: "roomTypeInfo" // Kết quả gán vào trường này
                    }
                },
                // Bước 5: Giải nén roomTypeInfo (nếu cần, vì lookup trả về mảng)
                {
                    $unwind: "$roomTypeInfo"
                },
                // Bước 6: Chọn các trường cần thiết
                {
                    $project: {
                        roomTypeId: "$_id",
                        totalBookings: 1,
                        roomTypeName: "$roomTypeInfo.roomTypeName",
                        _id: 0 // Loại bỏ _id gốc nếu không cần
                    }
                },
                // Bước 7: Lấy 2 phần tử đầu tiên trong danh sách (lớn nhất và nhỏ nhất)
                {
                    $facet: {
                        maxBookings: [{ $limit: 1 }],  // Lấy phần tử có totalBookings lớn nhất
                        minBookings: [{ $sort: { totalBookings: 1 } }, { $limit: 1 }]  // Lấy phần tử có totalBookings nhỏ nhất
                    }
                }
            ]);
            const totalBookingOfHotelByTime = await Booking.aggregate([
                // Bước 1: Lọc các booking hợp lệ
                {
                    $match: {
                        roomTypeId: { $in: checkRoomTypeIds },
                        status: { $nin: ["Đã hủy", "Đã hết phòng"], $ne: null }
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

            const totalRevenueOfHotelByTime = await Booking.aggregate([
                // Bước 1: Lọc các booking hợp lệ
                {
                    $match: {
                        roomTypeId: { $in: checkRoomTypeIds },
                        status: "Đã thanh toán"
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

            const theMostBookingUser = await Booking.aggregate([
                // Bước 1: Lọc các booking có status hợp lệ
                {
                    $match: {
                        status: { $nin: ["Đã hủy", "Đã hết phòng"], $ne: null },
                        roomTypeId: { $in: checkRoomTypeIds }  // Thêm điều kiện lọc roomTypeId
                    }
                },
                // Bước 2: Nhóm theo userId và đếm số lượng
                {
                    $group: {
                        _id: "$userId", // Nhóm theo userId
                        totalBookings: { $sum: 1 } // Đếm số lượng mỗi roomTypeId
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
                        fullname: "$userInfo.fullname",
                        phoneNumber: "$userInfo.phoneNumber",
                        email: "$userInfo.email",
                        address: "$userInfo.address",
                        image: "$userInfo.image",
                        birthDate: "$userInfo.birthDate",
                        _id: 0 // Loại bỏ _id gốc nếu không cần
                    }
                },
                // Bước 7: Lấy 2 phần tử đầu tiên trong danh sách (lớn nhất và nhỏ nhất)
                {
                    $facet: {
                        theMostBookingUser: [{ $limit: 1 }],  // Lấy phần tử có totalBookings lớn nhất
                        //minBookings: [{ $sort: { totalBookings: 1 } }, { $limit: 1 }]  // Lấy phần tử có totalBookings nhỏ nhất
                    }
                }
            ]);

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                ratingQuantity: checkHotel.ratingQuantity,
                ratingAverage: checkHotel.ratingAverage,
                totalBookingOfHotel: totalBookingOfHotel.length,
                totalCancelledBookingOfHotel: totalCancelledBookingOfHotel.length,
                totalBookingsByRoomType: totalBookingsByRoomType,
                totalBookingOfHotelByTime: totalBookingOfHotelByTime,
                totalRevenueOfHotelByTime: totalRevenueOfHotelByTime,
                theMostBookingUser: theMostBookingUser
            })

        } catch (e) {
            reject(e)
            console.log(e)
        }
    })
}