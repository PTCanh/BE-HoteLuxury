import RoomType from '../models/RoomType.js'
import Room from '../models/Room.js'
import Hotel from '../models/Hotel.js'
import jwt from 'jsonwebtoken'

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
const getRoomTypeByHotelId = (hotelId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoomType = await RoomType.find({
                hotelId: hotelId
            })
            if (checkRoomType.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get all RoomType by hotelId successfully',
                data: checkRoomType
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllRoomType = (headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            if(decoded.roleId !== "R2"){
                return resolve({
                    status: '401',
                    message: 'Not authenticated'
                })
            }
            const checkHotel = await Hotel.find({
                userId:decoded.userId
            })
            const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
            const checkRoomType = await RoomType.find({
                hotelId: {$in : checkHotelIds}
            })
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
            if (filter.hotelId) {
                formatFilter.hotelId = filter.hotelId
            }
            if (filter.roomTypeQuantity) {
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
            if (filter.maxPeople) {
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

const availableRoomTypes = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!filter.dayStart || !filter.dayEnd) {
                return resolve({
                    status: 'ERR',
                    message: `dayStart and dayEnd are required`
                })
            }

            // const formatFilter = {}
            // if (filter.hotelAddress) {
            //     formatFilter.hotelAddress = filter.hotelAddress.replace(/\s+/g, ' ').trim()
            //     formatFilter.hotelAddress = { $regex: new RegExp(formatFilter.hotelAddress, 'i') } // Không phân biệt hoa thường
            // }
            //Tìm các địa điểm khớp dữ liệu nhập vào
            // const locations = await Location.find(formatFilter)
            // if (locations.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: `Can not find the location`
            //     })
            // }
            //Chuyển sang id của các địa điểm đã tìm thấy
            // const locationIds = locations.map(location => location.locationId)
            //Tìm các hotel thuộc các địa điểm trên
            // const checkHotel = await Hotel.find({
            //     locationId: { $in: locationIds }
            // });

            //Tìm các hotel theo địa chỉ hotel
            // const checkHotel = await Hotel.find(formatFilter);
            // if (checkHotel.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: `Can not find any hotels`
            //     })
            // }
            // const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
            // //Tìm tất cả roomType của khách sạn
            // const roomTypes = await RoomType.find({
            //     hotelId: { $in: checkHotelIds }
            // })
            //console.log('RoomType: ', roomTypes.length)
            //Chuyển thành mảng roomTypeId
            // const roomTypeIds = roomTypes.map(roomType => roomType.roomTypeId)
            // Find all Rooms associated with all the RoomType
            const rooms = await Room.find({ roomTypeId: { $in: roomTypeIds } });
            //console.log('Room: ', rooms.length)
            //Chuyển thành mảng roomId
            const roomIds = rooms.map(room => room.roomId)
            //Tìm tất cả phòng đã được đặt
            const bookedRoomIds = await Schedule.find({
                roomId: { $in: roomIds },
                $or: [
                    { dayStart: { $gte: filter.dayStart, $lte: filter.dayEnd } },
                    { dayEnd: { $gte: filter.dayStart, $lte: filter.dayEnd } }
                ]
            }).distinct("roomId");
            //console.log('BookedRoom: ', bookedRoomIds.length)
            //Tìm những phòng còn trống
            const availableRooms = await Room.find({
                roomId: { $in: roomIds, $nin: bookedRoomIds }
            });
            //console.log('AvailableRoom: ', availableRooms)
            //Tìm id của roomType của các phòng trống
            const availableRoomTypeIds = availableRooms.map(room => room.roomTypeId)
            //console.log('availableRoomTypeIds: ', availableRoomTypeIds)
            //Tìm những roomType của các phòng trống
            const availableRoomTypes = await RoomType.find({
                roomTypeId: { $in: availableRoomTypeIds }
            })
            //console.log('availableRoomTypes: ', availableRoomTypes)
            //Tìm id của hotel của các phòng trống
            const availableHotelIds = availableRoomTypes.map(roomType => roomType.hotelId)
            //console.log('availableHotelIds: ', availableHotelIds.length)
            //console.log('availableHotelIds: ', availableHotelIds)
            //Tìm những hotel còn trống
            const availableHotels = await Hotel.find({
                hotelId: { $in: availableHotelIds }
            })
            //console.log('availableHotels: ', availableHotels.length)
            resolve({
                status: 'OK',
                message: 'Search hotel successfully',
                hotels: availableHotels,
                //roomTypes: availableRoomTypes
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
    filterRoomType,
    getRoomTypeByHotelId
}