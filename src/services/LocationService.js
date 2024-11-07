import Location from '../models/NotableLocation.js'


const createLocation = (location) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkLocation = await Location.findOne({
                locationName: { $regex: new RegExp(`^${location.locationName}$`, 'i') }
            })
            if (checkLocation !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The location is exist'
                })
            }

            await Location.create({
                locationName: location.locationName,
                locationImage: location.locationImage
            })
            resolve({
                status: 'OK',
                message: 'Create location successfully',
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
                notableLocationId: id
            })
            if (checkLocation === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The location is not exist'
                })
            }

            await Location.findOneAndUpdate({ notableLocationId: id },
                {
                    locationName: location.locationName,
                    locationImage: location.locationImage
                },
                { new: true })
            resolve({
                status: 'OK',
                message: 'Update location successfully',
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
                notableLocationId: id
            })
            if (checkLocation === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The location is not exist'
                })
            }

            await Location.findOneAndDelete({ notableLocationId: id },
                { new: true })
            resolve({
                status: 'OK',
                message: 'Delete location successfully',
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
                notableLocationId: id
            })
            if (checkLocation === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The location is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get detail location successfully',
                data: checkLocation
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
                    message: 'The location is empty'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get all location successfully',
                data: checkLocation
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
                    message: 'The location is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Search location successfully',
                data: checkLocation
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