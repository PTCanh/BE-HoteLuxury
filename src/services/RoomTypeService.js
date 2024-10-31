import RoomType from '../models/RoomType.js'
import Room from '../models/Room.js'

const createRoomType = (roomType) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoomType = await RoomType.findOne({
                hotelId: roomType.hotelId,
                roomTypeName: { $regex: new RegExp(`^${roomType.roomTypeName}$`, 'i') }
            })
            if (checkRoomType !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType is exist'
                })
            }

            await RoomType.create(roomType)
            resolve({
                status: 'OK',
                message: 'Create RoomType successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateRoomType = (roomType, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoomType = await RoomType.findOne({
                roomTypeId: id
            })
            if (checkRoomType === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType is not exist'
                })
            }

            await RoomType.findOneAndUpdate({ roomTypeId: id },
                roomType,
                { new: true })
            resolve({
                status: 'OK',
                message: 'Update RoomType successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteRoomType = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoomType = await RoomType.findOne({
                roomTypeId: id
            })
            if (checkRoomType === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType is not exist'
                })
            }

            await RoomType.findOneAndDelete({ roomTypeId: id })

            await Room.deleteMany({ roomTypeId: id })

            resolve({
                status: 'OK',
                message: 'Delete RoomType and all associated Rooms successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailRoomType = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoomType = await RoomType.findOne({
                roomTypeId: id
            })
            if (checkRoomType === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get detail RoomType successfully',
                data: checkRoomType
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllRoomType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoomType = await RoomType.find()
            if (checkRoomType === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType is empty'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get all RoomType successfully',
                data: checkRoomType
            })

        } catch (e) {
            reject(e)
        }
    })
}

const searchRoomType = (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!query.roomTypeName) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType is required'
                })
            }
            const roomTypeName = query.roomTypeName.replace(/\s+/g, ' ').trim()
            const checkRoomType = await RoomType.find({
                roomTypeName: { $regex: new RegExp(roomTypeName, 'i') } // Không phân biệt hoa thường
            });
            if (checkRoomType.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Search RoomType successfully',
                data: checkRoomType
            })

        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getDetailRoomType,
    getAllRoomType,
    searchRoomType
}