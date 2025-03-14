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
                    message: 'The location is exist',
                    statusCode: 404
                })
            }
            await Location.create(location)
            resolve({
                status: 'OK',
                message: 'Create location successfully',
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
                    message: 'The location is not exist',
                    statusCode: 404
                })
            }

            await Location.findOneAndUpdate({ locationId: id },
                location,
                { new: true })
            resolve({
                status: 'OK',
                message: 'Update location successfully',
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
                    message: 'The location is not exist',
                    statusCode: 404
                })
            }
            const checkHotel = await Hotel.findOne({
                locationId: id
            })
            if (checkHotel !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The location has hotels',
                    statusCode: 404
                })
            }
            await Location.findOneAndDelete({ locationId: id })
            resolve({
                status: 'OK',
                message: 'Delete location successfully',
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
                    message: 'The location is not exist',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Get detail location successfully',
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
                    message: 'The location is empty',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Get all location successfully',
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
                    message: 'The location is not exist',
                    statusCode: 404
                })
            }

            resolve({
                status: 'OK',
                message: 'Search location successfully',
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