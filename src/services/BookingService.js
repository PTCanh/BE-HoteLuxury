import Booking from '../models/Booking.js'
import RoomType from '../models/RoomType.js'
import Hotel from '../models/Hotel.js'
import Schedule from '../models/Schedule.js'
import Room from '../models/Room.js'

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
            })
            if (checkBooking === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Booking is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get detail Booking successfully',
                data: checkBooking
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllBooking = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkBooking = await Booking.find()
            if (checkBooking.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: 'The Booking is empty'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get all Booking successfully',
                data: checkBooking
            })

        } catch (e) {
            reject(e)
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

export default {
    createBooking,
    updateBooking,
    deleteBooking,
    getDetailBooking,
    getAllBooking,
    searchBooking,
    updateBookingPaymentUrl
}