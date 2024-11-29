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
            const rooms = await Room.find({ roomTypeId: booking.roomTypeId });

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
                roomId: { $in: roomIds, $nin: bookedRoomIds }
            });
            if (availableRooms.length === 0) {
                return resolve({
                    status: 'ERR0',
                    message: 'All rooms are used',
                })
            }
            if (availableRooms.length < booking.roomQuantity) {
                return resolve({
                    status: 'ERR1',
                    message: 'Rooms are not enough',
                })
            }
            //console.log("availableRooms: ",availableRooms.length)
            const checkRoomType = await RoomType.findOne({
                roomTypeId: booking.roomTypeId
            })
            //Tính tổng tiền
            const roomTypePrice = parseFloat(checkRoomType?.roomTypePrice) || 0;
            const roomQuantity = parseInt(booking.roomQuantity) || 0;
            booking.price = (roomTypePrice * roomQuantity).toString();
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
                message: 'Create Booking successfully',
                data: newBooking
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
                    message: 'The Booking is not exist'
                })
            }
            const searchedBooking = await Booking.findOne({ bookingId: id })
            const updatedBooking = await Booking.findOneAndUpdate({ bookingId: id },
                booking,
                { new: true })
            if (booking.isConfirmed === true && searchedBooking.isConfirmed === false) {
                // Find all Rooms associated with the RoomType
                const rooms = await Room.find({ roomTypeId: updatedBooking.roomTypeId });

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
                    roomId: { $in: roomIds, $nin: bookedRoomIds }
                }).sort({ roomId: 1 }); // Sắp xếp roomId tăng dần
                //console.log(availableRooms)
                if (availableRooms.length === 0) {
                    await Booking.findOneAndUpdate({ bookingId: id },
                        { isConfirmed: false },
                        { new: true })
                    return resolve({
                        status: 'ERR0',
                        message: 'All rooms are used',
                    })
                }
                if (availableRooms.length < booking.roomQuantity) {
                    await Booking.findOneAndUpdate({ bookingId: id },
                        { isConfirmed: false },
                        { new: true })
                    return resolve({
                        status: 'ERR1',
                        message: 'Rooms are not enough',
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
                message: 'Update Booking successfully',
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
                    message: 'The Booking is not exist'
                })
            }
            //delete schedule

            await Booking.findOneAndDelete({ bookingId: id },
                { new: true })

            resolve({
                status: 'OK',
                message: 'Delete Booking successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailBooking = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkBooking = await Booking.findOne({
                bookingId: id
            }).populate({
                path: 'bookingId',
                model: 'Schedule',
                localField: 'bookingId',
                foreignField: 'bookingId',
                populate: {
                    path: 'roomId', // Từ Schedule, populate tiếp sang Room
                    model: 'Room',
                    localField: 'roomId',
                    foreignField: 'roomId',
                    select: 'roomNumber', // Chỉ lấy trường roomNumber
                },
            }).lean()
            const formatedBooking = {
                ...checkBooking,
                bookingId: checkBooking.bookingId.bookingId,
                roomNumber: checkBooking.bookingId.roomId.roomNumber
            }
            // if (checkBooking === null) {
            //     return resolve({
            //         status: 'ERR',
            //         message: 'The Booking is not exist'
            //     })
            // }

            resolve({
                status: 'OK',
                message: 'Get detail Booking successfully',
                data: formatedBooking
            })

        } catch (e) {
            reject(e)
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
                const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
                const checkRoomType = await RoomType.find({
                    hotelId: { $in: checkHotelIds }
                })
                const checkRoomTypeIds = checkRoomType.map(roomType => roomType.roomTypeId)
                formatFilter.roomTypeId = { $in: checkRoomTypeIds }
                const allBookingOfHotel = await Booking.find(formatFilter)
                return resolve({
                    status: 'OK',
                    message: 'Get all Booking successfully',
                    data: allBookingOfHotel
                })
            }
            if (decoded.roleId === "R3") {
                // const checkHotel = await Hotel.find({
                //     userId: decoded.userId
                // })
                // const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
                // const checkRoomType = await RoomType.find({
                //     hotelId: {$in: checkHotelIds}
                // })
                // const checkRoomTypeIds = checkRoomType.map(roomType => roomType.roomTypeId)
                formatFilter.userId = decoded.userId
                const allBookingOfHotel = await Booking.find(formatFilter)
                return resolve({
                    status: 'OK',
                    message: 'Get all Booking successfully',
                    data: allBookingOfHotel
                })
            }
            const checkBooking = await Booking.find()
            // if (checkBooking.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: 'The Booking is empty'
            //     })
            // }

            resolve({
                status: 'OK',
                message: 'Get all Booking successfully',
                data: checkBooking
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
                message: 'Search Booking successfully',
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
                    message: "Booking not found",
                });
            }

            resolve({
                status: "OK",
                message: "Payment URL updated successfully",
                data: booking,
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

const confirmBooking = async (bookingId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkBooking = await Booking.findOne({ bookingId: bookingId });

            // Find all Rooms associated with the RoomType
            const rooms = await Room.find({ roomTypeId: checkBooking.roomTypeId });

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
                roomId: { $in: roomIds, $nin: bookedRoomIds }
            })
            if (checkBooking.roomQuantity > availableRooms.length) {
                return resolve({
                    status: "ERR",
                    message: "Not enough rooms",
                });
            }

            resolve({
                status: "OK",
                message: "Have enough rooms",
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

export default {
    createBooking,
    updateBooking,
    deleteBooking,
    getDetailBooking,
    getAllBooking,
    searchBooking,
    updateBookingPaymentUrl,
    confirmBooking
}