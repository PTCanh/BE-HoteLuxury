import Location from '../models/Location.js'
import Hotel from '../models/Hotel.js'

const createLocation = (location) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkLocation = await Location.findOne({
                locationName: { $regex: new RegExp(`^${location.locationName}$`, 'i') }
            })
            if (checkLocation !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'Địa điểm đã tồn tại',
                    statusCode: 404
                })
            }
            await Location.create(location)
            resolve({
                status: 'OK',
                message: 'Tạo địa điểm thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateLocation = (location, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkLocation = await Location.findOne({
                locationId: id
            })
            if (checkLocation === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Địa điểm không tồn tại',
                    statusCode: 404
                })
            }

            await Location.findOneAndUpdate({ locationId: id },
                location,
                { new: true })
            resolve({
                status: 'OK',
                message: 'Cập nhật địa điểm thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteLocation = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkLocation = await Location.findOne({
                locationId: id
            })
            if (checkLocation === null) {
                return resolve({
                    status: 'ERR0',
                    message: 'Địa điểm không tồn tại',
                    statusCode: 404
                })
            }
            const checkHotel = await Hotel.findOne({
                locationId: id
            })
            if (checkHotel !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'Địa điểm đã có khách sạn',
                    statusCode: 404
                })
            }
            await Location.findOneAndDelete({ locationId: id })
            resolve({
                status: 'OK',
                message: 'Xóa địa điểm thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailLocation = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkLocation = await Location.findOne({
                locationId: id
            })
            if (checkLocation === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Địa điểm không tồn tại',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Xem chi tiết địa điểm thành công',
                data: checkLocation,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllLocation = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkLocation = await Location.find()
            if (checkLocation === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Địa điểm không tồn tại',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Xem tất cả địa điểm thành công',
                data: checkLocation,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const filterLocation = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const formatFilter = {}
            if (filter.locationName) {
                formatFilter.locationName = filter.locationName.replace(/\s+/g, ' ').trim()
                formatFilter.locationName = { $regex: new RegExp(formatFilter.locationName, 'i') }
            }
            const checkLocation = await Location.find(formatFilter);
            if (checkLocation === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Địa điểm không tồn tại',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Tìm kiếm địa điểm thành công',
                data: checkLocation,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createLocation,
    updateLocation,
    deleteLocation,
    getDetailLocation,
    getAllLocation,
    filterLocation
}