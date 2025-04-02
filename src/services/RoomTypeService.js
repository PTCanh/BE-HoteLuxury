import RoomType from '../models/RoomType.js'
import Room from '../models/Room.js'
import Hotel from '../models/Hotel.js'
import Schedule from '../models/Schedule.js'
import Booking from '../models/Booking.js'
import jwt from 'jsonwebtoken'

const createRoomType = (roomType) => {
    return new Promise(async (resolve, reject) => {
        try {
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const checkRoomType = await RoomType.findOne({
                hotelId: roomType.hotelId,
                roomTypeName: { $regex: new RegExp(`^${escapeRegex(roomType.roomTypeName.trim())}$`, 'i') }
            })
            if (checkRoomType !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'Tên loại phòng đã tồn tại',
                    statusCode: 404
                })
            }

            const newRoomType = await RoomType.create(roomType)
            for (let i = 1; i <= roomType.roomTypeQuantity; i++) {
                await Room.create({
                    roomTypeId: newRoomType.roomTypeId
                })
            }

            resolve({
                status: 'OK',
                message: 'Tạo loại phòng thành công',
                statusCode: 200
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
                    message: 'Loại phòng không tồn tại',
                    statusCode: 404
                })
            }
            if (roomType.roomTypeQuantity) {
                if (checkRoomType.roomTypeQuantity < roomType.roomTypeQuantity) {
                    for (let i = checkRoomType.roomTypeQuantity; i < roomType.roomTypeQuantity; i++) {
                        await Room.create({
                            roomTypeId: checkRoomType.roomTypeId
                        })
                    }
                }
                else if (checkRoomType.roomTypeQuantity > roomType.roomTypeQuantity) {
                    let flag = 0
                    const roomIds = await Room.find({ roomTypeId: checkRoomType.roomTypeId, isActive: true }).distinct("roomId")
                    for (let i = checkRoomType.roomTypeQuantity; i > roomType.roomTypeQuantity; i--) {
                        await Room.findOneAndUpdate({
                            roomId: roomIds[roomIds.length - 1 - flag]
                        }, {
                            isActive: false
                        }, {
                            new: true
                        })
                        flag += 1
                    }
                }
            }

            await RoomType.findOneAndUpdate({ roomTypeId: id },
                roomType,
                { new: true })
            resolve({
                status: 'OK',
                message: 'Cập nhật loại phòng thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteRoomType = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let today = new Date()
            today = today.toISOString().split('T')[0]

            const checkRoomType = await RoomType.findOne({
                roomTypeId: id
            })
            if (checkRoomType === null) {
                return resolve({
                    status: 'ERR0',
                    message: 'Loại phòng không tồn tại',
                    statusCode: 404
                })
            }
            const checkBooking = await Booking.findOne({
                roomTypeId: id,
                dayEnd: { $gte: today }
            })

            if (checkBooking !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'Loại phòng đã có đơn đặt phòng',
                    statusCode: 404
                })
            }

            await RoomType.findOneAndDelete({ roomTypeId: id })

            await Room.deleteMany({ roomTypeId: id })

            resolve({
                status: 'OK',
                message: 'Xóa loại phòng và tất cả phòng trong loại này thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailRoomType = (id, filter, headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            //const token = headers.authorization.split(' ')[1]
            //const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            // if(decoded.roleId === "R2"){
            //     const checkRoomType = await RoomType.findOne({
            //         roomTypeId: id
            //     })
            //     return resolve({
            //         status: 'OK',
            //         message: 'Get detail RoomType successfully',
            //         data: checkRoomType,
            //     })
            // }
            if (!filter.dayStart || !filter.dayEnd) {
                return resolve({
                    status: 'ERR',
                    message: `dayStart và dayEnd cần có`,
                    statusCode: 404
                })
            }
            //tìm roomtype theo id
            const checkRoomType = await RoomType.findOne({
                roomTypeId: id
            }).lean()
            //Tìm tất cả room của roomtype
            const rooms = await Room.find({ roomTypeId: checkRoomType.roomTypeId, isActive: true });
            //Chuyển thành mảng roomId của hotel
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
            //Tìm những phòng còn trống của hotel
            const availableRooms = await Room.find({
                roomId: { $in: roomIds, $nin: bookedRoomIds },
                isActive: true
            });
            const formatedRommType = {
                ...checkRoomType,
                availableRoomQuantity: availableRooms.length
            }
            // if (checkRoomType === null) {
            //     return resolve({
            //         status: 'ERR',
            //         message: 'The RoomType is not exist'
            //     })
            // }

            resolve({
                status: 'OK',
                message: 'Xem chi tiết loại phòng thành công',
                data: formatedRommType,
                statusCode: 200
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
                    message: 'Loại phòng không tồn tại',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Xem tất cả loại phòng bằng hotelId thành công',
                data: checkRoomType,
                statusCode: 200
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
            if (decoded.roleId !== "R2") {
                return resolve({
                    statusCode: 401,
                    message: 'Không có quyền'
                })
            }
            const checkHotel = await Hotel.find({
                userId: decoded.userId
            })
            const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
            const checkRoomType = await RoomType.find({
                hotelId: { $in: checkHotelIds }
            })
            if (checkRoomType === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Loại phòng không tồn tại',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Xem tất cả loại phòng thành công',
                data: checkRoomType,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const filterRoomType = (headers, filter) => {
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
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            let filterRoomType = {}
            if (decoded.roleId === "R2") {
                const checkHotel = await Hotel.find({
                    userId: decoded.userId
                })
                const checkHotelIds = checkHotel.map(hotel => hotel.hotelId).filter(hotelId => !filter.hotelId || hotelId === Number(filter.hotelId))
                formatFilter.hotelId = { $in: checkHotelIds }
                filterRoomType = await RoomType.find(formatFilter)
                return resolve({
                    status: 'OK',
                    message: 'Xem tất cả loại phòng thành công',
                    data: filterRoomType,
                    statusCode: 200
                })
            }
            filterRoomType = await RoomType.find(formatFilter);
            if (filterRoomType.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `Không tìm thấy loại phòng nào`,
                    statusCode: 404
                })
            }
            resolve({
                status: 'OK',
                message: 'Lọc loại phòng thành công',
                data: filterRoomType,
                statusCode: 200
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
                    message: `dayStart và dayEnd cần có`,
                    statusCode: 404
                })
            }
            //tìm tất cả roomType của hotel
            const checkRoomType = await RoomType.find({
                hotelId: filter.hotelId
            })
            //Chuyển thành mảng Id
            const checkRoomTypeIds = checkRoomType.map(roomType => roomType.roomTypeId)
            //Tìm tất cả room của hotel
            const rooms = await Room.find({ roomTypeId: { $in: checkRoomTypeIds }, isActive: true });
            //console.log('Room: ', rooms.length)
            //Chuyển thành mảng roomId của hotel
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
            //Tìm những phòng còn trống của hotel
            const availableRooms = await Room.find({
                roomId: { $in: roomIds, $nin: bookedRoomIds },
                isActive: true
            });
            //console.log('AvailableRoom: ', availableRooms)
            //Tìm id của roomType của các phòng trống
            const availableRoomTypeIds = availableRooms.map(room => room.roomTypeId)
            //console.log('availableRoomTypeIds: ', availableRoomTypeIds)
            //Tìm những roomType của các phòng trống
            const availableRoomTypes = await RoomType.find({
                roomTypeId: { $in: availableRoomTypeIds }
            })
            resolve({
                status: 'OK',
                message: 'Lấy các loại phòng còn trống thành công',
                hotels: availableRoomTypes,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailRoomTypeByHotelManager = (id, filter, headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            if (decoded.roleId === "R2") {
                const checkRoomType = await RoomType.findOne({
                    roomTypeId: id
                })
                return resolve({
                    status: 'OK',
                    message: 'Xem chi tiết loại phòng thành công',
                    data: checkRoomType,
                })
            }

            resolve({
                status: 'OK',
                message: 'Xem chi tiết loại phòng thành công',
                data: [],
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
    getRoomTypeByHotelId,
    availableRoomTypes,
    getDetailRoomTypeByHotelManager
}