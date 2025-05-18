import Schedule from '../models/Schedule.js'
import RoomType from '../models/RoomType.js'
import Room from '../models/Room.js'
import Hotel from '../models/Hotel.js'
import Booking from '../models/Booking.js'
import jwt from 'jsonwebtoken'

const createSchedule = (schedule) => {
    return new Promise(async (resolve, reject) => {
        try {
            const scheduleDayStart = new Date(schedule.dayStart)
            const scheduleDayEnd = new Date(schedule.dayEnd)
            if (!schedule?.bookingId) {
                return resolve({
                    status: 'ERR',
                    message: 'Thiếu bookingId',
                    statusCode: 400
                });
            }
            const checkBooking = await Booking.findOne({ bookingId: schedule.bookingId })
            if (checkBooking === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy đơn đặt phòng tương ứng',
                    statusCode: 404
                })
            }
            const allScheduleInRoom = await Schedule.find({ roomId: schedule.roomId })
            const duplicatedSchedule = allScheduleInRoom.filter(sche => (scheduleDayStart <= sche.dayEnd && scheduleDayStart >= sche.dayStart)
                || (scheduleDayEnd <= sche.dayEnd && scheduleDayEnd >= sche.dayStart))
            if (duplicatedSchedule.length > 0) {
                return resolve({
                    status: 'ERR',
                    message: 'Không thể tạo lịch vì phòng đã sử dụng trong ngày này',
                    statusCode: 400
                })
            }
            await Schedule.create(schedule)
            checkBooking.roomQuantity += 1
            await checkBooking.save()

            resolve({
                status: 'OK',
                message: 'Tạo lịch đặt phòng thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateSchedule = (schedule, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newDayEnd = new Date(schedule.dayEnd)
            const checkSchedule = await Schedule.findOne({
                scheduleId: id
            })
            if (checkSchedule === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Lịch đặt phòng không tồn tại',
                    statusCode: 404
                })
            }
            if (newDayEnd <= checkSchedule.dayEnd) {
                return resolve({
                    status: 'ERR',
                    message: 'dayEnd mới phải lớn hơn dayEnd ban đầu',
                    statusCode: 400
                });
            }
            const allScheduleInRoom = await Schedule.find({ roomId: checkSchedule.roomId })
            const duplicatedSchedule = allScheduleInRoom.filter(sche => {
                if (sche.scheduleId === Number(id)) return false;
                return (
                    newDayEnd <= sche.dayEnd && newDayEnd >= sche.dayStart
                )
            })
            if (duplicatedSchedule.length > 0) {
                return resolve({
                    status: 'ERR',
                    message: 'Không thể cập nhật dayEnd mới vì phòng đã sử dụng trong ngày này',
                    statusCode: 400
                })
            }
            await Schedule.findOneAndUpdate({ scheduleId: id },
                schedule,
                { new: true })
            resolve({
                status: 'OK',
                message: 'Cập nhật lịch đặt phòng thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteSchedule = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkSchedule = await Schedule.findOne({
                scheduleId: id
            })
            if (checkSchedule === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Lịch đặt phòng không tồn tại',
                    statusCode: 404
                })
            }
            const checkBooking = await Booking.findOne({ bookingId: checkSchedule.bookingId })
            if (checkBooking.status !== "Đã thanh toán") {
                return resolve({
                    status: 'ERR',
                    message: 'Chỉ có thể xóa lịch hẹn của đơn đặt phòng đã thanh toán',
                    statusCode: 400
                })
            }
            //delete schedule
            await Schedule.findOneAndDelete({ scheduleId: id },
                { new: true })
            checkBooking.roomQuantity -= 1
            await checkBooking.save()

            resolve({
                status: 'OK',
                message: 'Xóa lịch đặt phòng thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailSchedule = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkSchedule = await Schedule.findOne({
                scheduleId: id
            }).populate({
                path: 'bookingId',
                model: 'Booking',
                localField: 'bookingId',
                foreignField: 'bookingId',
                select: 'bookingCode'
            }).lean()

            if (checkSchedule === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Lịch đặt phòng không tồn tại',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Xem chi tiết lịch đặt phòng thành công',
                data: checkSchedule,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllSchedule = (headers, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            const checkHotel = await Hotel.findOne({ userId: decoded.userId, isDeleted: false })
            const checkRoomType = await RoomType.find({ hotelId: checkHotel.hotelId })
            const roomTypeIds = checkRoomType.map(roomtype => roomtype.roomTypeId)
            const checkRoom = await Room.find({ roomTypeId: { $in: roomTypeIds }, isActive: true })
            const roomIds = checkRoom.map(room => room.roomId)
            let checkSchedule = await Schedule.find({
                roomId: { $in: roomIds }
            }).populate({
                path: 'bookingId',
                model: 'Booking',
                localField: 'bookingId',
                foreignField: 'bookingId',
                select: 'bookingCode customerName customerPhone roomTypeId',
                populate: {
                    path: 'roomTypeId',
                    model: 'RoomType',
                    localField: 'roomTypeId',
                    foreignField: 'roomTypeId',
                    select: 'roomTypeName'
                }
            }).lean()
            checkSchedule = checkSchedule.map(schedule => ({
                ...schedule,
                bookingCode: schedule.bookingId?.bookingCode,
                customerName: schedule.bookingId?.customerName,
                customerPhone: schedule.bookingId?.customerPhone,
                roomTypeName: schedule.bookingId?.roomTypeId?.roomTypeName,
                bookingId: schedule.bookingId?.bookingId,
                dayStartFilter: schedule.dayStart.toISOString().split('T')[0],
                dayEndFilter: schedule.dayEnd.toISOString().split('T')[0]
            })).sort((a, b) => {
                return b.dayStart - a.dayStart;
            });
            if (filter.checkInStart && filter.checkInEnd) {
                checkSchedule = checkSchedule.filter(schedule => (schedule.dayStartFilter >= filter.checkInStart && schedule.dayStartFilter <= filter.checkInEnd))
            }
            if (filter.checkOutStart && filter.checkOutEnd) {
                checkSchedule = checkSchedule.filter(schedule => (schedule.dayEndFilter >= filter.checkOutStart && schedule.dayEndFilter <= filter.checkOutEnd))
            }
            resolve({
                status: 'OK',
                message: 'Xem tất cả lịch đặt phòng thành công',
                data: checkSchedule,
                statusCode: 200
            })

        } catch (e) {
            console.log(e)
            reject(e)
        }
    })
}

const searchSchedule = (body) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(body)
            // if (!query.scheduleStatus) {
            //     return resolve({
            //         status: 'ERR',
            //         message: 'The Schedule status is required'
            //     })
            // }
            //const scheduleStatus = query.scheduleStatus.replace(/\s+/g, ' ').trim()
            // const checkSchedule = await Schedule.find({
            //     scheduleStatus: { $regex: new RegExp(`^${scheduleStatus}$`, 'i') } // Không phân biệt hoa thường
            // });
            // if (checkSchedule.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: `The Schedule is not found`
            //     })
            // }

            resolve({
                status: 'OK',
                message: 'Tìm kiếm lịch đặt phòng thành công',
                //data: checkSchedule
            })

        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getDetailSchedule,
    getAllSchedule,
    searchSchedule
}