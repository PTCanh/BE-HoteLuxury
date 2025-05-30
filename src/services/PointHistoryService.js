import PointHistory from '../models/PointHistory.js'
import jwt from 'jsonwebtoken'

const createPointHistory = (pointHistory) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newPointHistory = await PointHistory.create(pointHistory)
            resolve({
                status: 'OK',
                message: 'Tạo lịch sử điểm thành công',
                data: newPointHistory,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updatePointHistory = (id, pointHistory) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkPointHistory = await PointHistory.findOne({ pointHistoryId: id })
            if (!checkPointHistory) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy lịch sử điểm',
                    statusCode: 404
                })
            }
            await PointHistory.findOneAndUpdate({ pointHistoryId: id }, pointHistory, { new: true })
            resolve({
                status: 'OK',
                message: 'Cập nhật lịch sử điểm thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deletePointHistory = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkPointHistory = await PointHistory.findOne({ pointHistoryId: id })
            if (!checkPointHistory) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy lịch sử điểm',
                    statusCode: 404
                })
            }
            await PointHistory.findOneAndDelete({ pointHistoryId: id })
            resolve({
                status: 'OK',
                message: 'Xóa lịch sử điểm thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllPointHistory = (headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            let checkPointHistory = await PointHistory.find({ userId: decoded.userId })
            checkPointHistory = checkPointHistory.sort((a, b) => {
                return b.createdAt - a.createdAt;
            })

            resolve({
                status: 'OK',
                message: 'Xem tất cả lịch sử điểm thành công',
                data: checkPointHistory,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createPointHistory,
    updatePointHistory,
    deletePointHistory,
    getAllPointHistory,
}