import Room from '../models/Room.js'
import RoomType from '../models/RoomType.js'
import Hotel from '../models/Hotel.js'

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
            const checkRoom = await Room.findOne({
                roomId: id
            })
            if (checkRoom === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Room is not exist'
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

const searchRoom = (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!query.roomStatus) {
                return resolve({
                    status: 'ERR',
                    message: 'The room status is required'
                })
            }
            const roomStatus = query.roomStatus.replace(/\s+/g, ' ').trim()
            const checkRoom = await Room.find({
                roomStatus: { $regex: new RegExp(`^${roomStatus}$`, 'i') } // Không phân biệt hoa thường
            });
            if (checkRoom.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `The room is not found`
                })
            }

            resolve({
                status: 'OK',
                message: 'Search Room successfully',
                data: checkRoom
            })

        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createRoom,
    updateRoom,
    deleteRoom,
    getDetailRoom,
    getAllRoom,
    searchRoom
}