import Notification from '../models/Notification.js'
import jwt from 'jsonwebtoken'

const createNotification = (notification) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newNotification = await Notification.create(notification)
            resolve({
                status: 'OK',
                message: 'Tạo thông báo thành công',
                data: newNotification,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateNotification = (id, notification) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkNotification = await Notification.findOne({ notificationId: id })
            if (!checkNotification) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy thông báo',
                    statusCode: 404
                })
            }
            await Notification.findOneAndUpdate({ notificationId: id }, notification, { new: true })
            resolve({
                status: 'OK',
                message: 'Cập nhật thông báo thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteNotification = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkNotification = await Notification.findOne({ notificationId: id })
            if (!checkNotification) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy thông báo',
                    statusCode: 404
                })
            }
            await Notification.findOneAndDelete({ notificationId: id })
            resolve({
                status: 'OK',
                message: 'Xóa thông báo thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllNotification = (headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            let checkNotification = await Notification.find({ userId: decoded.userId })
            checkNotification = checkNotification.sort((a, b) => {
                return b.createdAt - a.createdAt;
            })

            resolve({
                status: 'OK',
                message: 'Xem tất cả thông báo thành công',
                data: checkNotification,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const readAllNotification = (headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            await Notification.updateMany({ userId: decoded.userId }, {isRead: true})
            resolve({
                status: 'OK',
                message: 'Đọc tất cả thông báo thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteAllNotification = (headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            await Notification.deleteMany({ userId: decoded.userId })
            resolve({
                status: 'OK',
                message: 'Xóa tất cả thông báo thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createNotification,
    updateNotification,
    deleteNotification,
    getAllNotification,
    readAllNotification,
    deleteAllNotification
}