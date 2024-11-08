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

const filterRoomType = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const formatFilter = {}
            if(filter.hotelId){
                formatFilter.hotelId = filter.hotelId
            }
            if(filter.roomTypeQuantity){
                formatFilter.roomTypeQuantity = filter.roomTypeQuantity
            }
            if (filter.roomTypeName) {
                formatFilter.roomTypeName = filter.roomTypeName.replace(/\s+/g, ' ').trim()
                formatFilter.roomTypeName = { $regex: new RegExp(formatFilter.roomTypeName, 'i') } // Không phân biệt hoa thường
            }
            if (filter.roomTypePrice) {
                formatFilter.roomTypePrice = filter.roomTypePrice.replace(/\s+/g, ' ').trim()
                formatFilter.roomTypePrice = { $regex: new RegExp(formatFilter.roomTypePrice) }
            }
            if (filter.hotelType) {
                formatFilter.hotelType = filter.hotelType.replace(/\s+/g, ' ').trim()
                formatFilter.hotelType = { $regex: new RegExp(formatFilter.hotelType, 'i') }
            }
            if(filter.maxPeople){
                formatFilter.maxPeople = filter.maxPeople
            }
            const filterRoomType = await RoomType.find(formatFilter);
            if (filterRoomType.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `No RoomType is found`
                })
            }
            resolve({
                status: 'OK',
                message: 'Filter RoomType successfully',
                data: filterRoomType
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
    filterRoomType
}