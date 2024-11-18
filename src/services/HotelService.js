import Hotel from '../models/Hotel.js'
import RoomType from '../models/RoomType.js'
import Room from '../models/Room.js'
import User from '../models/User.js'
import Schedule from '../models/Schedule.js'
import Location from '../models/Location.js'
import jwt from 'jsonwebtoken'

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
            }).lean()
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

const getAllHotel = (headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            let checkHotel = {}
            if (decoded.roleId === "R2") {
                checkHotel = await Hotel.find({
                    userId: decoded.userId
                })
                return resolve({
                    status: 'OK',
                    message: 'Get all hotel successfully',
                    data: checkHotel
                })
            }
            checkHotel = await Hotel.find()
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

const searchHotel = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!filter.dayStart || !filter.dayEnd) {
                return resolve({
                    status: 'ERR',
                    message: `dayStart and dayEnd are required`
                })
            }

            const formatFilter = {}
            if (filter.locationName) {
                formatFilter.locationName = filter.locationName.replace(/\s+/g, ' ').trim()
                formatFilter.locationName = { $regex: new RegExp(formatFilter.locationName, 'i') } // Không phân biệt hoa thường
            }
            //Tìm các địa điểm khớp dữ liệu nhập vào
            const locations = await Location.find(formatFilter)
            if (locations.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `Can not find the location`
                })
            }
            //Chuyển sang id của các địa điểm đã tìm thấy
            const locationIds = locations.map(location => location.locationId)
            //Tìm các hotel thuộc các địa điểm trên
            const checkHotel = await Hotel.find({
                locationId: { $in: locationIds }
            });
            if (checkHotel.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `Can not find any hotels`
                })
            }
            const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
            //Tìm tất cả roomType của khách sạn
            const roomTypes = await RoomType.find({
                hotelId: { $in: checkHotelIds }
            })
            //console.log('RoomType: ', roomTypes.length)
            //Chuyển thành mảng roomTypeId
            const roomTypeIds = roomTypes.map(roomType => roomType.roomTypeId)
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

const userFilterHotel = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Khách sạn đã tìm kiếm
            const searchedHotels = await searchHotel(filter)
            if (!searchedHotels.hotels || searchedHotels.hotels.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `Can not filter any hotels`
                })
            }
            const searchedHotelIds = searchedHotels.hotels.map(hotel => hotel.hotelId)
            //Lọc khách sạn
            const formatFilter = {}
            if (filter.hotelType) {
                formatFilter.hotelType = filter.hotelType.replace(/\s+/g, ' ').trim()
                formatFilter.hotelType = { $regex: new RegExp(formatFilter.hotelType, 'i') }
            }
            if (filter.hotelStar) {
                formatFilter.hotelStar = filter.hotelStar
            }
            const filterHotel = await Hotel.find(formatFilter);
            const filterHotelIds = filterHotel.map(hotel => hotel.hotelId)
            //Tìm hotelId có trong cả tìm kiếm và lọc
            const intersectedHotelIds = searchedHotelIds.filter(hotelId => filterHotelIds.includes(hotelId));
            //Lấy thông tin khách sạn từ hotelId
            const finalFilterHotel = await Hotel.find({
                hotelId: { $in: intersectedHotelIds }
            });

            if (finalFilterHotel.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `No hotel is found`
                })
            }
            resolve({
                status: 'OK',
                message: 'Filter Hotel successfully',
                data: finalFilterHotel
            })

        } catch (e) {
            reject(e)
        }
    })
}

const filterHotel = (headers, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const formatFilter = {}
            if (filter.hotelName) {
                formatFilter.hotelName = filter.hotelName.replace(/\s+/g, ' ').trim()
                formatFilter.hotelName = { $regex: new RegExp(formatFilter.hotelName, 'i') } // Không phân biệt hoa thường
            }
            if (filter.hotelAddress) {
                formatFilter.hotelAddress = filter.hotelAddress.replace(/\s+/g, ' ').trim()
                formatFilter.hotelAddress = { $regex: new RegExp(formatFilter.hotelAddress, 'i') } // Không phân biệt hoa thường
            }
            if (filter.hotelPhoneNumber) {
                formatFilter.hotelPhoneNumber = filter.hotelPhoneNumber.replace(/\s+/g, ' ').trim()
                formatFilter.hotelPhoneNumber = { $regex: new RegExp(formatFilter.hotelPhoneNumber) }
            }
            if (filter.hotelType) {
                formatFilter.hotelType = filter.hotelType.replace(/\s+/g, ' ').trim()
                formatFilter.hotelType = { $regex: new RegExp(formatFilter.hotelType, 'i') }
            }
            if (filter.hotelStar) {
                formatFilter.hotelStar = filter.hotelStar
            }
            if (filter.locationId) {
                formatFilter.locationId = filter.locationId
            }
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            let filterHotel = {}
            if (decoded.roleId === "R2") {
                formatFilter.userId = decoded.userId
                filterHotel = await Hotel.find(formatFilter)
                return resolve({
                    status: 'OK',
                    message: 'Get all hotel successfully',
                    data: filterHotel
                })
            }
            filterHotel = await Hotel.find(formatFilter);
            if (filterHotel.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `No hotel is found`
                })
            }
            resolve({
                status: 'OK',
                message: 'Filter Hotel successfully',
                data: filterHotel
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
    searchHotel,
    userFilterHotel,
    filterHotel
}