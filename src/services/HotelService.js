import Hotel from '../models/Hotel.js'
import RoomType from '../models/RoomType.js'
import Room from '../models/Room.js'

const createHotel = (hotel) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Hotel.create(hotel)
            resolve({
                status: 'OK',
                message: 'Create hotel successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateHotel = (hotel, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkHotel = await Hotel.findOne({
                hotelId: id
            })
            if (checkHotel === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Hotel is not exist'
                })
            }

            await Hotel.findOneAndUpdate({ hotelId: id },
                hotel,
                { new: true })
            resolve({
                status: 'OK',
                message: 'Update hotel successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteHotel = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkHotel = await Hotel.findOne({
                hotelId: id
            })
            if (checkHotel === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The hotel is not exist'
                })
            }

            // Get all RoomTypes associated with the Hotel
            const roomTypes = await RoomType.find({ hotelId: id });

            // Collect RoomType IDs to delete later
            const roomTypeIds = roomTypes.map(roomType => roomType.roomTypeId);

            // 5. Delete all Rooms
            await Room.deleteMany({ roomTypeId: { $in: roomTypeIds } });

            // 6. Delete all RoomTypes
            await RoomType.deleteMany({ hotelId: id });

            // 7. Delete the Hotel
            await Hotel.findOneAndDelete({ hotelId: id });

            resolve({
                status: 'OK',
                message: 'Delete hotel, all associated RoomType and Room successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailHotel = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkHotel = await Hotel.findOne({
                hotelId: id
            })
            if (checkHotel === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The hotel is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get detail hotel successfully',
                data: checkHotel
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllHotel = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkHotel = await Hotel.find()
            if (checkHotel === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The hotel is empty'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get all hotel successfully',
                data: checkHotel
            })

        } catch (e) {
            reject(e)
        }
    })
}

const searchHotel = (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!query.hotelName) {
                return resolve({
                    status: 'ERR',
                    message: 'The hotel is required'
                })
            }
            const hotelName = query.hotelName.replace(/\s+/g, ' ').trim()
            const checkHotel = await Hotel.find({
                hotelName: { $regex: new RegExp(hotelName, 'i') } // Không phân biệt hoa thường
            });
            if (checkHotel.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: 'The hotel is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Search hotel successfully',
                data: checkHotel
            })

        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createHotel,
    updateHotel,
    deleteHotel,
    getDetailHotel,
    getAllHotel,
    searchHotel
}