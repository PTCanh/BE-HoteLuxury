import Booking from '../models/Booking.js'
import RoomType from '../models/RoomType.js'
import Hotel from '../models/Hotel.js'
import Schedule from '../models/Schedule.js'
import Room from '../models/Room.js'
import jwt from 'jsonwebtoken'

const createBooking = (booking) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Find all Rooms associated with the RoomType
            const rooms = await Room.find({
                roomTypeId: booking.roomTypeId,
                isActive: true
            });

            // Get the IDs of all Rooms for the RoomType
            const roomIds = rooms.map(room => room.roomId);

            const bookedRoomIds = await Schedule.find({
                roomId: { $in: roomIds },
                $or: [
                    { dayStart: { $gte: booking.dayStart, $lte: booking.dayEnd } },
                    { dayEnd: { $gte: booking.dayStart, $lte: booking.dayEnd } }
                ]
            }).distinct("roomId");

            //console.log("bookedRoomIds: ",bookedRoomIds)
            const availableRooms = await Room.find({
                roomId: { $in: roomIds, $nin: bookedRoomIds },
                isActive: true
            });
            if (availableRooms.length === 0) {
                return resolve({
                    status: 'ERR0',
                    message: 'Tất cả phòng đã được sử dụng',
                    statusCode: 404
                })
            }
            if (availableRooms.length < booking.roomQuantity) {
                return resolve({
                    status: 'ERR1',
                    message: 'Không đủ phòng',
                    statusCode: 404
                })
            }
            //console.log("availableRooms: ",availableRooms.length)
            const checkRoomType = await RoomType.findOne({
                roomTypeId: booking.roomTypeId
            })
            //Tính tổng tiền
            // const roomTypePrice = parseFloat(checkRoomType?.roomTypePrice) || 0;
            // const roomQuantity = parseInt(booking.roomQuantity) || 0;
            // booking.price = (roomTypePrice * roomQuantity).toString();

            const newBooking = await Booking.create(booking)
            // const newSchedule = {
            //     roomId: availableRooms[0].roomId,
            //     bookingId: newBooking.bookingId,
            //     dayStart: booking.dayStart,
            //     dayEnd: booking.dayEnd
            // }
            // await Schedule.create(newSchedule)
            resolve({
                status: 'OK',
                message: 'Tạo đơn đặt phòng thành công',
                data: newBooking,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
            console.log(e)
        }
    })
}

const updateBooking = (booking, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkBooking = await Booking.findOne({
                bookingId: id
            })
            if (checkBooking === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Đơn đặt phòng không tồn tại',
                    statusCode: 404
                })
            }
            const searchedBooking = await Booking.findOne({ bookingId: id })
            const updatedBooking = await Booking.findOneAndUpdate({ bookingId: id },
                booking,
                { new: true })
            if (booking.isConfirmed === true && searchedBooking.isConfirmed === false && (updatedBooking.status === "Chưa thanh toán" || updatedBooking.status === "Đã thanh toán")) {
                // Find all Rooms associated with the RoomType
                const rooms = await Room.find({ roomTypeId: updatedBooking.roomTypeId, isActive: true });

                // Get the IDs of all Rooms for the RoomType
                const roomIds = rooms.map(room => room.roomId);

                const bookedRoomIds = await Schedule.find({
                    roomId: { $in: roomIds },
                    $or: [
                        { dayStart: { $gte: updatedBooking.dayStart, $lte: updatedBooking.dayEnd } },
                        { dayEnd: { $gte: updatedBooking.dayStart, $lte: updatedBooking.dayEnd } }
                    ]
                }).distinct("roomId");
                //console.log(bookedRoomIds)
                //console.log("bookedRoomIds: ",bookedRoomIds.length)
                const availableRooms = await Room.find({
                    roomId: { $in: roomIds, $nin: bookedRoomIds },
                    isActive: true
                }).sort({ roomId: 1 }); // Sắp xếp roomId tăng dần
                //console.log(availableRooms)
                if (availableRooms.length === 0) {
                    await Booking.findOneAndUpdate({ bookingId: id },
                        { isConfirmed: false },
                        { new: true })
                    return resolve({
                        status: 'ERR0',
                        message: 'Tất cả phòng đã được sử dụng',
                        statusCode: 404
                    })
                }
                if (availableRooms.length < updatedBooking.roomQuantity) {
                    await Booking.findOneAndUpdate({ bookingId: id },
                        { isConfirmed: false },
                        { new: true })
                    return resolve({
                        status: 'ERR1',
                        message: 'Không đủ phòng',
                        statusCode: 404
                    })
                }

                // Tạo mảng newSchedules
                //const newSchedules = [];
                for (let i = 0; i < updatedBooking.roomQuantity; i++) {
                    const newSchedule = new Schedule({
                        roomId: availableRooms[i].roomId, // Lấy roomId theo thứ tự
                        bookingId: updatedBooking.bookingId,
                        dayStart: updatedBooking.dayStart,
                        dayEnd: updatedBooking.dayEnd,
                    });
                    await newSchedule.save()
                }

                // Thêm các schedule vào cơ sở dữ liệu
                //await Schedule.insertMany(newSchedules); // lỗi autoIncrement
            }
            resolve({
                status: 'OK',
                message: 'Cập nhật đơn đặt phòng thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteBooking = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkBooking = await Booking.findOne({
                bookingId: id
            })
            if (checkBooking === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Đơn đặt phòng không tồn tại',
                    statusCode: 404
                })
            }
            //delete schedule

            await Booking.findOneAndDelete({ bookingId: id },
                { new: true })

            resolve({
                status: 'OK',
                message: 'Xóa đơn đặt phòng thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailBooking = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkBooking = await Booking.find({
                bookingId: id
            }).populate({
                path: 'roomTypeId',
                model: 'RoomType',
                localField: 'roomTypeId',
                foreignField: 'roomTypeId',
                select: 'hotelId roomTypeName roomTypeImage',
                populate: {
                    path: 'hotelId',
                    model: 'Hotel',
                    localField: 'hotelId',
                    foreignField: 'hotelId',
                    select: 'hotelName'
                }
            }).populate({
                path: 'bookingId',
                model: 'Schedule',
                localField: 'bookingId',
                foreignField: 'bookingId',
                select: 'roomId',
                populate: {
                    path: 'roomId', // Từ Schedule, populate tiếp sang Room
                    model: 'Room',
                    localField: 'roomId',
                    foreignField: 'roomId',
                    select: 'roomNumber', // Chỉ lấy trường roomNumber
                },
            }).lean()
            const checkSchedule = await Schedule.find({
                bookingId: id
            }).populate({
                path: 'roomId',
                model: 'Room',
                localField: 'roomId',
                foreignField: 'roomId',
                select: 'roomNumber'
            }).lean()
            const roomNumber = checkSchedule.filter(schedule => schedule.roomId?.roomNumber).map(schedule => schedule.roomId.roomNumber);
            const formatedBooking = {
                ...checkBooking[0],
                hotelName: checkBooking[0].roomTypeId?.hotelId.hotelName || null,
                roomTypeName: checkBooking[0].roomTypeId?.roomTypeName || null,
                roomTypeImage: checkBooking[0].roomTypeId?.roomTypeImage || null,
                roomNumber: roomNumber,
                roomTypeId: checkBooking[0].roomTypeId?.roomTypeId || null,
                bookingId: checkBooking[0].bookingId?.bookingId || null,
            }
            // if (checkBooking === null) {
            //     return resolve({
            //         status: 'ERR',
            //         message: 'The Booking is not exist'
            //     })
            // }

            resolve({
                status: 'OK',
                message: 'Xem chi tiết đơn đặt phòng thành công',
                data: formatedBooking
            })

        } catch (e) {
            reject(e)
            console.log(e)
        }
    })
}

const getAllBooking = (headers, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            //console.log(headers, filter)
            const formatFilter = {}
            if (filter.isConfirmed) {
                formatFilter.isConfirmed = filter.isConfirmed
            }
            if (filter.roomTypeId) {
                formatFilter.roomTypeId = filter.roomTypeId
            }
            if (filter.customerName) {
                formatFilter.customerName = filter.customerName.replace(/\s+/g, ' ').trim()
                formatFilter.customerName = { $regex: new RegExp(formatFilter.customerName, 'i') } // Không phân biệt hoa thường
            }
            if (filter.status) {
                formatFilter.status = filter.status.replace(/\s+/g, ' ').trim()
                formatFilter.status = { $regex: new RegExp(formatFilter.status, 'i') } // Không phân biệt hoa thường
            }
            if (filter.paymentMethod) {
                formatFilter.paymentMethod = filter.paymentMethod.replace(/\s+/g, ' ').trim()
                formatFilter.paymentMethod = { $regex: new RegExp(formatFilter.paymentMethod, 'i') } // Không phân biệt hoa thường
            }
            if (filter.customerPhone) {
                formatFilter.customerPhone = filter.customerPhone.replace(/\s+/g, ' ').trim()
                formatFilter.customerPhone = { $regex: new RegExp(formatFilter.customerPhone, 'i') } // Không phân biệt hoa thường
            }
            if (filter.customerEmail) {
                formatFilter.customerEmail = filter.customerEmail.replace(/\s+/g, ' ').trim()
                formatFilter.customerEmail = { $regex: new RegExp(formatFilter.customerEmail, 'i') } // Không phân biệt hoa thường
            }
            if (filter.isConfirmed) {
                formatFilter.isConfirmed = filter.isConfirmed
            }
            if (filter.status) {
                formatFilter.status = filter.status.replace(/\s+/g, ' ').trim()
                formatFilter.status = { $regex: new RegExp(formatFilter.status, 'i') } // Không phân biệt hoa thường
            }
            if (filter.dayStart) {
                formatFilter.dayStart = new Date(filter.dayStart)
                //formatFilter.dayStart = { $regex: new RegExp(formatFilter.dayStart, 'i') } // Không phân biệt hoa thường
            }
            if (filter.dayEnd) {
                formatFilter.dayEnd = new Date(filter.dayEnd)
                //formatFilter.dayEnd = { $regex: new RegExp(formatFilter.dayEnd, 'i') } // Không phân biệt hoa thường
            }
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)


            // const checkHotel = await Hotel.find({
            //     userId: decoded.userId
            // })
            // const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
            // const checkRoomType = await RoomType.find({
            //     hotelId: {$in: checkHotelIds}
            // })
            // const checkRoomTypeIds = checkRoomType.map(roomType => roomType.roomTypeId)
            formatFilter.userId = decoded.userId
            const allBookingOfUser = await Booking.find(formatFilter).lean()
            // Lưu lại bookingId gốc
            allBookingOfUser.forEach(booking => {
                booking.originalBookingId = booking.bookingId;
            })
            // Sau đó, thực hiện populate
            const populatedBookings = await Booking.populate(allBookingOfUser, [
                {
                    path: 'roomTypeId',
                    model: 'RoomType',
                    localField: 'roomTypeId',
                    foreignField: 'roomTypeId',
                    select: 'hotelId roomTypeName roomTypeImage',
                    populate: {
                        path: 'hotelId',
                        model: 'Hotel',
                        localField: 'hotelId',
                        foreignField: 'hotelId',
                        select: 'hotelName'
                    }
                },
                {
                    path: 'bookingId',
                    model: 'Schedule',
                    localField: 'bookingId',
                    foreignField: 'bookingId',
                    select: 'roomId',
                    populate: {
                        path: 'roomId', // Từ Schedule, populate tiếp sang Room
                        model: 'Room',
                        localField: 'roomId',
                        foreignField: 'roomId',
                        select: 'roomNumber', // Chỉ lấy trường roomNumber
                    },
                },
            ])
            const allSchedule = await Schedule.find()
                .populate({
                    path: 'roomId',
                    model: 'Room',
                    localField: 'roomId',
                    foreignField: 'roomId',
                    select: 'roomNumber'
                }).lean()
            let formatedAllBookingOfUser = populatedBookings.map((booking) => {
                // Lấy roomNumber từ booking.bookingId.roomId (nếu có)
                // let roomNumbers = [];
                // if (Array.isArray(booking.bookingId)) {
                //     roomNumbers = booking.bookingId
                //         .map((schedule) => schedule.roomId?.roomNumber)
                //         .filter((roomNumber) => roomNumber); // Lọc bỏ các giá trị `null` hoặc `undefined`
                // } else if (booking.bookingId?.roomId?.roomNumber) {
                //     roomNumbers.push(booking.bookingId.roomId.roomNumber);
                // }
                const checkSchedule = allSchedule.filter(schedule => (schedule.bookingId === booking.originalBookingId))
                const roomNumbers = checkSchedule.filter(schedule => schedule.roomId?.roomNumber).map(schedule => schedule.roomId.roomNumber);

                return {
                    ...booking,
                    hotelId: booking.roomTypeId?.hotelId?.hotelId || null,
                    hotelName: booking.roomTypeId?.hotelId?.hotelName || null,
                    roomTypeName: booking.roomTypeId?.roomTypeName || null,
                    roomTypeImage: booking.roomTypeId?.roomTypeImage || null,
                    roomNumber: roomNumbers, // Mảng roomNumber
                    roomTypeId: booking.roomTypeId?.roomTypeId || null,
                    bookingId: booking.originalBookingId, // Giữ bookingId dù không populate được
                };
            }).sort((a, b) => {
                const dateA = new Date(a.dayStart);
                const dateB = new Date(b.dayStart);
                return dateA - dateB;
            });
            const currentDate = new Date();
            const today = currentDate.toISOString().split('T')[0]
            //const bookingStatus = ["Chờ xác nhận", "Đã xác nhận", "Đang thực hiện", "Đã hoàn tất", "Đã hủy"]
            if (filter.bookingStatus) {
                if (filter.bookingStatus === "Chờ xác nhận") {
                    formatedAllBookingOfUser = formatedAllBookingOfUser.filter((booking) => (booking.isConfirmed === false && booking.status !== "Đã hết phòng" && booking.status !== "Đã hủy"))
                }
                else if (filter.bookingStatus === "Đã xác nhận") {
                    formatedAllBookingOfUser = formatedAllBookingOfUser.filter((booking) => (booking.isConfirmed === true && booking.dayStart.toISOString().split('T')[0] > today && booking.status !== "Đã hết phòng" && booking.status !== "Đã hủy"))
                }
                else if (filter.bookingStatus === "Đang thực hiện") {
                    formatedAllBookingOfUser = formatedAllBookingOfUser.filter((booking) => (booking.isConfirmed === true && booking.dayStart.toISOString().split('T')[0] <= today && booking.dayEnd.toISOString().split('T')[0] >= today && booking.status !== "Đã hết phòng" && booking.status !== "Đã hủy"))
                }
                else if (filter.bookingStatus === "Đã hoàn tất") {
                    formatedAllBookingOfUser = formatedAllBookingOfUser.filter((booking) => (booking.isConfirmed === true && booking.dayEnd.toISOString().split('T')[0] < today && booking.status !== "Đã hết phòng" && booking.status !== "Đã hủy"))
                }
                else if (filter.bookingStatus === "Đã hủy") {
                    formatedAllBookingOfUser = formatedAllBookingOfUser.filter((booking) => (booking.status === "Đã hết phòng" || booking.status === "Đã hủy"))
                }
            }

            return resolve({
                status: 'OK',
                message: 'Xem tất cả đơn đặt phòng thành công',
                data: formatedAllBookingOfUser
            })

        } catch (e) {
            reject(e)
            console.error(e)
        }
    })
}

const searchBooking = (header) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(header)
            console.log(header['user-id'])
            // if (!query.bookingStatus) {
            //     return resolve({
            //         status: 'ERR',
            //         message: 'The Booking status is required'
            //     })
            // }
            //const bookingStatus = query.bookingStatus.replace(/\s+/g, ' ').trim()
            // const checkBooking = await Booking.find({
            //     bookingStatus: { $regex: new RegExp(`^${bookingStatus}$`, 'i') } // Không phân biệt hoa thường
            // });
            // if (checkBooking.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: `The Booking is not found`
            //     })
            // }

            resolve({
                status: 'OK',
                message: 'TÌm kiếm đơn đặt phòng thành công',
                //data: checkBooking
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateBookingPaymentUrl = async (bookingId, paymentUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            const booking = await Booking.findOneAndUpdate(
                { bookingId: bookingId },
                { paymentUrl: paymentUrl },
                { new: true }
            );

            if (!booking) {
                return resolve({
                    status: "ERR",
                    message: "Không tìm thấy đơn đặt phòng",
                    statusCode: 404
                });
            }

            resolve({
                status: "OK",
                message: "Payment URL cập nhật thành công",
                data: booking,
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

const confirmBooking = async (bookingId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkBooking = await Booking.findOne({ bookingId: bookingId });

            // Find all Rooms associated with the RoomType
            const rooms = await Room.find({ roomTypeId: checkBooking.roomTypeId, isActive: true });

            // Get the IDs of all Rooms for the RoomType
            const roomIds = rooms.map(room => room.roomId);

            const bookedRoomIds = await Schedule.find({
                roomId: { $in: roomIds },
                $or: [
                    { dayStart: { $gte: checkBooking.dayStart, $lte: checkBooking.dayEnd } },
                    { dayEnd: { $gte: checkBooking.dayStart, $lte: checkBooking.dayEnd } }
                ]
            }).distinct("roomId");
            //console.log(bookedRoomIds)
            //console.log("bookedRoomIds: ",bookedRoomIds.length)
            const availableRooms = await Room.find({
                roomId: { $in: roomIds, $nin: bookedRoomIds },
                isActive: true
            })
            if (checkBooking.roomQuantity > availableRooms.length) {
                return resolve({
                    status: "ERR",
                    message: "Không đủ phòng",
                    statusCode: 404
                });
            }

            resolve({
                status: "OK",
                message: "Đủ phòng",
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

const getAllBookingByHotelManager = (headers, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            //console.log(headers, filter)
            const formatFilter = {}
            if (filter.isConfirmed) {
                formatFilter.isConfirmed = JSON.parse(filter.isConfirmed)
            }
            if (filter.roomTypeId) {
                formatFilter.roomTypeId = filter.roomTypeId
            }
            if (filter.customerName) {
                formatFilter.customerName = filter.customerName.replace(/\s+/g, ' ').trim()
                formatFilter.customerName = { $regex: new RegExp(formatFilter.customerName, 'i') } // Không phân biệt hoa thường
            }
            if (filter.status) {
                formatFilter.status = filter.status.replace(/\s+/g, ' ').trim()
                formatFilter.status = { $regex: new RegExp(formatFilter.status, 'i') } // Không phân biệt hoa thường
            }
            if (filter.paymentMethod) {
                formatFilter.paymentMethod = filter.paymentMethod.replace(/\s+/g, ' ').trim()
                formatFilter.paymentMethod = { $regex: new RegExp(formatFilter.paymentMethod, 'i') } // Không phân biệt hoa thường
            }
            if (filter.customerPhone) {
                formatFilter.customerPhone = filter.customerPhone.replace(/\s+/g, ' ').trim()
                formatFilter.customerPhone = { $regex: new RegExp(formatFilter.customerPhone, 'i') } // Không phân biệt hoa thường
            }
            if (filter.customerEmail) {
                formatFilter.customerEmail = filter.customerEmail.replace(/\s+/g, ' ').trim()
                formatFilter.customerEmail = { $regex: new RegExp(formatFilter.customerEmail, 'i') } // Không phân biệt hoa thường
            }
            if (filter.status) {
                formatFilter.status = filter.status.replace(/\s+/g, ' ').trim()
                formatFilter.status = { $regex: new RegExp(formatFilter.status, 'i') } // Không phân biệt hoa thường
            }
            if (filter.dayStart) {
                formatFilter.dayStart = new Date(filter.dayStart)
                //formatFilter.dayStart = { $regex: new RegExp(formatFilter.dayStart, 'i') } // Không phân biệt hoa thường
            }
            if (filter.dayEnd) {
                formatFilter.dayEnd = new Date(filter.dayEnd)
                //formatFilter.dayEnd = { $regex: new RegExp(formatFilter.dayEnd, 'i') } // Không phân biệt hoa thường
            }
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            if (decoded.roleId === "R2") {
                const checkHotel = await Hotel.find({
                    userId: decoded.userId
                })
                let checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
                if (filter.hotelId) {
                    checkHotelIds = checkHotelIds.filter(hotelId => (hotelId === Number(filter.hotelId)))
                }
                const checkRoomType = await RoomType.find({
                    hotelId: { $in: checkHotelIds }
                })
                const checkRoomTypeIds = checkRoomType.map(roomType => roomType.roomTypeId)
                formatFilter.roomTypeId = { $in: checkRoomTypeIds }
                let allBookingOfHotel = await Booking.find(formatFilter)
                    .populate({
                        path: 'roomTypeId',
                        model: 'RoomType',
                        localField: 'roomTypeId',
                        foreignField: 'roomTypeId',
                        select: 'hotelId'
                    }).lean()
                allBookingOfHotel = allBookingOfHotel.map((booking) => {
                    return {
                        ...booking,
                        hotelId: booking.roomTypeId?.hotelId || null,
                        roomTypeId: booking.roomTypeId?.roomTypeId || null,
                    };
                }).sort((a, b) => {
                    const dateA = new Date(a.dayStart);
                    const dateB = new Date(b.dayStart);
                    return dateA - dateB;
                })
                return resolve({
                    status: 'OK',
                    message: 'Xem tất cả đơn đặt phòng thành công',
                    data: allBookingOfHotel
                })
            }
            //const checkBooking = await Booking.find()
            // if (checkBooking.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: 'The Booking is empty'
            //     })
            // }

            resolve({
                status: 'OK',
                message: 'Xem tất cả đơn đặt phòng thành công',
                data: []
            })

        } catch (e) {
            reject(e)
            console.error(e)
        }
    })
}

export default {
    createBooking,
    updateBooking,
    deleteBooking,
    getDetailBooking,
    getAllBooking,
    searchBooking,
    updateBookingPaymentUrl,
    confirmBooking,
    getAllBookingByHotelManager
}