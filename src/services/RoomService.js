import Room from '../models/Room.js'
import RoomType from '../models/RoomType.js'
import Hotel from '../models/Hotel.js'
import Schedule from '../models/Schedule.js'
import jwt from 'jsonwebtoken'

const createRoom = (room) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoomType = await RoomType.findOne({
                roomTypeId: room.roomTypeId
            })
            // Get the hotel ID from the RoomType
            const hotelId = checkRoomType.hotelId;

            // Find all RoomTypes associated with the hotel
            const roomTypes = await RoomType.find({ hotelId: hotelId });

            // Get the IDs of all RoomTypes for the hotel
            const roomTypeIds = roomTypes.map(roomType => roomType.roomTypeId);

            // Check if a room with the same roomNumber exists in any RoomType for this hotel
            const checkRoom = await Room.findOne({
                roomNumber: room.roomNumber,
                roomTypeId: { $in: roomTypeIds } // Check across all RoomTypes for this hotel
            });

            if (checkRoom !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Room number already exists for this hotel'
                });
            }
            await Room.create(room)
            // if (room.status === "empty") {
            //     const roomEmptyQuantity = await Room.countDocuments({
            //         roomTypeId: room.roomTypeId,
            //         roomStatus: room.status
            //     })
            //     await RoomType.findOneAndUpdate({
            //         roomTypeId: room.roomTypeId
            //     }, {
            //         roomEmptyQuantity
            //     }, {
            //         new: true
            //     })
            // }
            const roomTypeQuantity = await Room.countDocuments({ roomTypeId: room.roomTypeId })
            await RoomType.findOneAndUpdate({
                roomTypeId: room.roomTypeId
            }, {
                roomTypeQuantity
            }, {
                new: true
            })
            resolve({
                status: 'OK',
                message: 'Create Room successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateRoom = (room, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoom = await Room.findOne({
                roomId: id
            })
            if (checkRoom === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Room is not exist'
                })
            }

            await Room.findOneAndUpdate({ roomId: id },
                room,
                { new: true })
            // if (room.status === "empty") {
            //     const roomEmptyQuantity = await Room.countDocuments({
            //         roomTypeId: room.roomTypeId,
            //         roomStatus: room.status
            //     })
            //     await RoomType.findOneAndUpdate({
            //         roomTypeId: room.roomTypeId
            //     }, {
            //         roomEmptyQuantity
            //     }, {
            //         new: true
            //     })
            // }
            resolve({
                status: 'OK',
                message: 'Update Room successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteRoom = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let today = new Date()
            today = today.toISOString().split('T')[0]

            const checkRoom = await Room.findOne({
                roomId: id
            })
            if (checkRoom === null) {
                return resolve({
                    status: 'ERR0',
                    message: 'The Room is not exist'
                })
            }
            const checkSchedule = await Schedule.findOne({
                roomId: id,
                dayEnd: {$gte: today}
            })

            if (checkSchedule !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The room has bookings'
                })
            }
            await Room.findOneAndDelete({ roomId: id },
                { new: true })
            // if (checkRoom.status === "empty") {
            //     const roomEmptyQuantity = await Room.countDocuments({
            //         roomTypeId: checkRoom.roomTypeId,
            //         roomStatus: checkRoom.status
            //     })
            //     await RoomType.findOneAndUpdate({
            //         roomTypeId: checkRoom.roomTypeId
            //     }, {
            //         roomEmptyQuantity
            //     }, {
            //         new: true
            //     })
            // }
            const roomTypeQuantity = await Room.countDocuments({ roomTypeId: checkRoom.roomTypeId })
            await RoomType.findOneAndUpdate({
                roomTypeId: checkRoom.roomTypeId
            }, {
                roomTypeQuantity
            }, {
                new: true
            })
            resolve({
                status: 'OK',
                message: 'Delete Room successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailRoom = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoom = await Room.findOne({
                roomId: id
            })
                .populate({
                    path: 'roomTypeId',
                    model: 'RoomType',
                    localField: 'roomTypeId',
                    foreignField: 'roomTypeId',
                    select: 'hotelId roomTypePrice'
                })
            if (checkRoom === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Room is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get detail Room successfully',
                data: checkRoom
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllRoom = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoom = await Room.find()
            if (checkRoom === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Room is empty'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get all Room successfully',
                data: checkRoom
            })

        } catch (e) {
            reject(e)
        }
    })
}

const filterRoom = (headers, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const formatFilter = {}
            if (filter.roomTypeId) {
                formatFilter.roomTypeId = filter.roomTypeId
            }
            if (filter.roomNumber) {
                formatFilter.roomNumber = filter.roomNumber.replace(/\s+/g, ' ').trim()
                formatFilter.roomNumber = { $regex: new RegExp(formatFilter.roomNumber) }
            }
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            let filterRoom = {}
            if (decoded.roleId === "R2") {
                const checkHotel = await Hotel.find({
                    userId: decoded.userId
                })
                const checkHotelIds = checkHotel.map(hotel => hotel.hotelId).filter(hotelId => !filter.hotelId || hotelId === Number(filter.hotelId))
                const checkRoomType = await RoomType.find({
                    hotelId: { $in: checkHotelIds }
                })
                const checkRoomTypeIds = checkRoomType.map(roomType => roomType.roomTypeId).filter(roomTypeId => !filter.roomTypeId || roomTypeId === Number(filter.roomTypeId))
                formatFilter.roomTypeId = { $in: checkRoomTypeIds }
                filterRoom = await Room.find(formatFilter)
                    .populate({
                        path: 'roomTypeId',
                        model: 'RoomType',
                        localField: 'roomTypeId',
                        foreignField: 'roomTypeId',
                        select: 'hotelId roomTypePrice'
                    })
                return resolve({
                    status: 'OK',
                    message: 'Get all Room successfully',
                    data: filterRoom
                })
            }
            filterRoom = await Room.find(formatFilter)
                .populate({
                    path: 'roomTypeId',
                    model: 'RoomType',
                    localField: 'roomTypeId',
                    foreignField: 'roomTypeId',
                    select: 'hotelId roomTypePrice'
                })
            //const validRooms = filterRoom.filter(room => room.roomTypeId !== null);
            // if(query.hotelId){
            //     filterRoom = filterRoom.filter((room) => {
            //         return room.roomTypeId?.hotelId?.toString() === query.hotelId
            //     })
            // }
            // if (validRooms.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: `No room is found`
            //     })
            // }
            resolve({
                status: 'OK',
                message: 'Filter room successfully',
                data: filterRoom
            })
        } catch (e) {
            reject(e)
            console.error(e)
        }
    })
}

export default {
    createRoom,
    updateRoom,
    deleteRoom,
    getDetailRoom,
    getAllRoom,
    filterRoom
}