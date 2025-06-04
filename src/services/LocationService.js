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
                locationId: id,
                isDeleted: false
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
            let checkLocation = await Hotel.aggregate([
                {
                    $match: {
                        isDeleted: false
                    }
                },
                {
                    $lookup: {
                        from: 'locations',
                        let: { locationId: '$locationId' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$locationId', '$$locationId'] } } }
                        ],
                        as: 'location'
                    }
                },
                { $unwind: '$location' },
                {
                    $group: {
                        _id: '$location.locationId',
                        locationId: { $first: '$location.locationId' },
                        locationImage: { $first: '$location.locationImage' },
                        locationName: { $first: '$location.locationName' },
                        totalHotel: { $sum: 1 },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        locationId: 1,
                        locationImage: 1,
                        locationName: 1,
                        totalHotel: 1,
                    }
                },
                {
                    $sort: { totalHotel: -1 }
                },
            ]);

            const checkLocationIds = checkLocation.map(location => location.locationId)
            let otherLocations = await Location.find({ locationId: { $nin: checkLocationIds } })
            otherLocations = otherLocations.map(location => {
                return {
                    locationId: location.locationId,
                    locationImage: location.locationImage,
                    locationName: location.locationName,
                    totalHotel: 0
                }
            })
            const mergedArray = [...checkLocation, ...otherLocations];

            resolve({
                status: 'OK',
                message: 'Xem tất cả địa điểm thành công',
                data: mergedArray,
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