import Schedule from '../models/Schedule.js'
import RoomType from '../models/RoomType.js'
import Room from '../models/Room.js'
import Hotel from '../models/Hotel.js'

const createSchedule = (schedule) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Schedule.create(schedule)

            resolve({
                status: 'OK',
                message: 'Create Schedule successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateSchedule = (schedule, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkSchedule = await Schedule.findOne({
                scheduleId: id
            })
            if (checkSchedule === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Schedule is not exist',
                    statusCode: 404
                })
            }

            await Schedule.findOneAndUpdate({ scheduleId: id },
                schedule,
                { new: true })
            resolve({
                status: 'OK',
                message: 'Update Schedule successfully',
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
                    message: 'The Schedule is not exist',
                    statusCode: 404
                })
            }
            //delete schedule

            await Schedule.findOneAndDelete({ scheduleId: id },
                { new: true })

            resolve({
                status: 'OK',
                message: 'Delete Schedule successfully',
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
            })
            if (checkSchedule === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Schedule is not exist',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Get detail Schedule successfully',
                data: checkSchedule,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllSchedule = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkSchedule = await Schedule.find()
            if (checkSchedule.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: 'The Schedule is empty',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Get all Schedule successfully',
                data: checkSchedule,
                statusCode: 200
            })

        } catch (e) {
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
                message: 'Search Schedule successfully',
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