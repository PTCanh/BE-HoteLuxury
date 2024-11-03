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
                    { dayStart: { $gte: booking.dayStart, $lte: booking.dayEnd }},
                    {dayEnd: { $gte: booking.dayStart, $lte: booking.dayEnd } }
                ]
            }).distinct("roomId");
            
            //console.log("bookedRoomIds: ",bookedRoomIds.length)
            const availableRooms = await Room.find({
                roomId: { $in: roomIds, $nin: bookedRoomIds }
            });
            if(availableRooms.length === 0){
                return resolve({
                    status: 'OK',
                    message: 'All rooms are used',
                })
            }
            //console.log("availableRooms: ",availableRooms.length)
            const newBooking = await Booking.create(booking)
            const newSchedule = {
                roomId: availableRooms[0].roomId,
                bookingId: newBooking.bookingId,
                dayStart: booking.dayStart,
                dayEnd: booking.dayEnd
            }
            await Schedule.create(newSchedule)
            resolve({
                status: 'OK',
                message: 'Create Booking and Schedule successfully',
            })

        } catch (e) {
            reject(e)
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

            await Booking.findOneAndUpdate({ bookingId: id },
                booking,
                { new: true })
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

export default {
    createBooking,
    updateBooking,
    deleteBooking,
    getDetailBooking,
    getAllBooking,
    searchBooking
}