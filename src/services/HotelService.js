import Hotel from '../models/Hotel.js'
import RoomType from '../models/RoomType.js'
import Room from '../models/Room.js'
import User from '../models/User.js'
import Schedule from '../models/Schedule.js'
import Location from '../models/Location.js'
import Booking from '../models/Booking.js'
import jwt from 'jsonwebtoken'

const createHotel = (hotel) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Hotel.create(hotel)
            resolve({
                status: 'OK',
                message: 'Tạo khách sạn thành công',
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
                    message: 'Khách sạn không tồn tại',
                    statusCode: 404
                })
            }

            await Hotel.findOneAndUpdate({ hotelId: id },
                hotel,
                { new: true })
            resolve({
                status: 'OK',
                message: 'Cập nhật khách sạn thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteHotel = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let today = new Date()
            today = today.toISOString().split('T')[0]

            const checkHotel = await Hotel.findOne({
                hotelId: id
            })
            if (checkHotel === null) {
                return resolve({
                    status: 'ERR0',
                    message: 'Khách sạn không tồn tại',
                    statusCode: 404
                })
            }

            // Get all RoomTypes associated with the Hotel
            const roomTypes = await RoomType.find({ hotelId: id });

            // Collect RoomType IDs to delete later
            const roomTypeIds = roomTypes.map(roomType => roomType.roomTypeId);

            const checkBooking = await Booking.findOne({
                roomTypeId: { $in: roomTypeIds },
                dayEnd: { $gte: today }
            })

            if (checkBooking !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'Khách sạn có đơn đặt phòng',
                    statusCode: 404
                })
            }

            // 5. Delete all Rooms
            await Room.deleteMany({ roomTypeId: { $in: roomTypeIds } });

            // 6. Delete all RoomTypes
            await RoomType.deleteMany({ hotelId: id });

            // 7. Delete the Hotel
            await Hotel.findOneAndDelete({ hotelId: id });

            resolve({
                status: 'OK',
                message: 'Xóa khách sạn, tất cả phòng và loại phòng của khách sạn thành công',
                statusCode: 200
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
                    message: 'Khách sạn không tồn tại',
                    statusCode: 404
                })
            }
            resolve({
                status: 'OK',
                message: 'Xem chi tiết khách sạn thành công',
                data: checkHotel,
                statusCode: 200
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
                    message: 'Xem tất cả khách sạn thành công',
                    data: checkHotel
                })
            }
            checkHotel = await Hotel.find()
            resolve({
                status: 'OK',
                message: 'Xem tất cả khách sạn thành công',
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
                    message: `dayStart và dayEnd phải có`,
                    statusCode: 404
                })
            }
            // Bộ lọc
            const regex = new RegExp(filter.filter, 'i');
            //Khách sạn đã tìm kiếm
            const hotels = await Hotel.find()
                .populate({
                    path: "locationId",
                    model: "Location",
                    localField: "locationId",
                    foreignField: "locationId",
                    select: "locationName",
                }).lean()
            const formatHotels = hotels.map(hotel => ({
                ...hotel,
                locationId: hotel.locationId?.locationId || null,
                locationName: hotel.locationId?.locationName || null
            }))
            //Tìm các địa điểm khớp dữ liệu nhập vào
            // const locations = await Location.find(formatFilter)
            // if (locations.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: `Can not find the location`
            //     })
            // }
            //Chuyển sang id của các địa điểm đã tìm thấy
            // const locationIds = locations.map(location => location.locationId)
            //Tìm các hotel thuộc các địa điểm trên
            // const checkHotel = await Hotel.find({
            //     locationId: { $in: locationIds }
            // });

            //Tìm các hotel theo địa chỉ hotel
            const checkHotel = formatHotels.filter((hotel) => {
                return (
                    regex.test(hotel.locationName) ||
                    regex.test(hotel.hotelName) ||
                    regex.test(hotel.hotelAddress)
                );
            })

            //const checkHotel = await Hotel.find(formatFilter);
            if (checkHotel.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `Không tìm thấy khách sạn nào`,
                    data: checkHotel,
                    outOfRoom: checkHotel,
                    statusCode: 404
                })
            }
            // Id của tất cả khách sạn tìm được
            const checkHotelIds = checkHotel.map(hotel => hotel.hotelId)
            //Tìm tất cả roomType của khách sạn
            const roomTypes = await RoomType.find({
                hotelId: { $in: checkHotelIds }
            })
            //console.log('RoomType: ', roomTypes.length)
            //Chuyển thành mảng roomTypeId
            const roomTypeIds = roomTypes.map(roomType => roomType.roomTypeId)
            // Find all Rooms associated with all the RoomType
            const rooms = await Room.find({ roomTypeId: { $in: roomTypeIds }, isActive: true });
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
            //Tính giá nhỏ nhất của từng khách sạn
            let minPriceOfHotels = {}
            availableRoomTypes.forEach((roomType) => {
                if (!minPriceOfHotels[roomType.hotelId]) {
                    minPriceOfHotels[roomType.hotelId] = roomType.roomTypePrice
                } else {
                    if (minPriceOfHotels[roomType.hotelId] > roomType.roomTypePrice) {
                        minPriceOfHotels[roomType.hotelId] = roomType.roomTypePrice
                    }
                }
            })
            // let minPriceArray = Object.entries(minPriceOfHotels).map(([hotelId, minPrice]) => ({
            //     hotelId,
            //     minPrice,
            // }));
            // console.log(minPriceOfHotels);
            // console.log(minPriceArray);
            //console.log('availableRoomTypes: ', availableRoomTypes)
            //Tìm id của hotel của các phòng trống
            const availableHotelIds = availableRoomTypes.map(roomType => roomType.hotelId)
            //Tìm id của hotel hết phòng
            const noAvailableHotelIds = checkHotelIds.filter(hotelId => !availableHotelIds.includes(hotelId));
            //console.log('availableHotelIds: ', availableHotelIds.length)
            //console.log('availableHotelIds: ', availableHotelIds)
            //Tìm những hotel còn trống
            const availableHotels = await Hotel.find({
                hotelId: { $in: availableHotelIds }
            }).lean()
            //Tìm những hotel hết phòng
            const noAvailableHotels = await Hotel.find({
                hotelId: { $in: noAvailableHotelIds }
            }).lean()
            availableHotels.forEach((hotel) => {
                hotel.minPrice = minPriceOfHotels[hotel.hotelId] || null; // Lấy giá từ minPriceOfHotels hoặc để null nếu không có
            });
            //console.log('availableHotels: ', availableHotels.length)
            resolve({
                status: 'OK',
                message: 'Tìm khách sạn thành công',
                data: availableHotels,
                outOfRoom: noAvailableHotels,
                statusCode: 200
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
            const searchedHotel = await searchHotel(filter)
            const searchedHotels = searchedHotel.hotels
            // if (!searchedHotels.hotels || searchedHotels.hotels.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: `Can not filter any hotels`
            //     })
            // }
            //const searchedHotelIds = searchedHotels.hotels.map(hotel => hotel.hotelId)
            //Lọc khách sạn
            // const formatFilter = {}
            // if (filter.hotelName) {
            //     formatFilter.hotelName = filter.hotelName.replace(/\s+/g, ' ').trim()
            //     formatFilter.hotelName = { $regex: new RegExp(formatFilter.hotelName, 'i') } // Không phân biệt hoa thường
            // }
            // if (filter.hotelType) {
            //     const hotelTypes = filter.hotelType.split(',')
            //     formatFilter.hotelType = { $in: hotelTypes }
            // }
            // if (filter.hotelStar) {
            //     const hotelStars = filter.hotelStar.split(',')
            //     formatFilter.hotelStar = { $in: hotelStars }
            // }
            const formatFilter = {
                hotelName: filter.hotelName ? filter.hotelName.replace(/\s+/g, ' ').trim().toLowerCase() : null,
                hotelType: filter.hotelType ? filter.hotelType.split(',') : null,
                hotelStar: filter.hotelStar ? filter.hotelStar.split(',') : null,
                minPrice: filter.minPrice ? filter.minPrice.split(',') : null,
            };
            //console.log(formatFilter, parseFloat(formatFilter.minPrice[0]))
            // const filteredHotels = searchedHotels.filter((hotel) => {
            //     return (
            //         (!formatFilter.hotelName || (hotel.hotelName && hotel.hotelName.toLowerCase().includes(formatFilter.hotelName))) &&
            //         (!formatFilter.hotelType || (hotel.hotelType && formatFilter.hotelType.includes(hotel.hotelType))) &&
            //         (!formatFilter.hotelStar || (hotel.hotelStar && formatFilter.hotelStar.includes(String(hotel.hotelStar))))
            //     );
            // });
            //console.log(searchedHotels)
            const filteredHotels = searchedHotels.filter((hotel) => {
                return (
                    (!formatFilter.hotelName || (hotel.hotelName && hotel.hotelName.toLowerCase().includes(formatFilter.hotelName))) &&
                    (!formatFilter.hotelType || (Array.isArray(formatFilter.hotelType) && formatFilter.hotelType.includes(hotel.hotelType))) &&
                    (!formatFilter.hotelStar || (Array.isArray(formatFilter.hotelStar) && formatFilter.hotelStar.includes(String(hotel.hotelStar)))) &&
                    (!formatFilter.minPrice || (
                        Array.isArray(formatFilter.minPrice) &&
                        parseFloat(hotel.minPrice) >= parseFloat(formatFilter.minPrice[0]) &&
                        parseFloat(hotel.minPrice) <= parseFloat(formatFilter.minPrice[1])
                    ))
                );
            });

            // const filterHotel = await Hotel.find(formatFilter);
            // const filterHotelIds = filterHotel.map(hotel => hotel.hotelId)
            // //Tìm hotelId có trong cả tìm kiếm và lọc
            // const intersectedHotelIds = searchedHotelIds.filter(hotelId => filterHotelIds.includes(hotelId));
            // //Lấy thông tin khách sạn từ hotelId
            // const finalFilterHotel = await Hotel.find({
            //     hotelId: { $in: intersectedHotelIds }
            // });

            // if (finalFilterHotel.length === 0) {
            //     return resolve({
            //         status: 'ERR',
            //         message: `No hotel is found`
            //     })
            // }
            resolve({
                status: 'OK',
                message: 'Lọc khách sạn thành công',
                data: filteredHotels
            })

        } catch (e) {
            reject(e)
            console.log(e)
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
                    message: 'Xem tất cả khách sạn thành công',
                    data: filterHotel,
                    statusCode: 200
                })
            }
            filterHotel = await Hotel.find(formatFilter);
            if (filterHotel.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `Không tìm thấy khách sạn nào`,
                    statusCode: 404
                })
            }
            resolve({
                status: 'OK',
                message: 'Lọc khách sạn thành công',
                data: filterHotel,
                statusCode: 200
            })
        } catch (e) {
            reject(e)
        }
    })
}

const suggestedHotel = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Bộ lọc
            const regex = new RegExp(filter.filter, 'i');
            //Khách sạn đã tìm kiếm
            const hotels = await Hotel.find()
                .populate({
                    path: "locationId",
                    model: "Location",
                    localField: "locationId",
                    foreignField: "locationId",
                    select: "locationName",
                }).lean()
            const formatHotels = hotels.map(hotel => ({
                ...hotel,
                locationId: hotel.locationId.locationId,
                locationName: hotel.locationId.locationName
            }))
            const suggestedHotels = formatHotels.filter((hotel) => {
                return (
                    regex.test(hotel.locationName) ||
                    regex.test(hotel.hotelName)
                    // ||
                    // regex.test(hotel.hotelAddress)
                );
            })
            const provinces = await Hotel.distinct("hotelAddress"); // Lấy tất cả hotelAddress
            const uniqueProvinces = provinces
                .map((address) => address.split(',').pop().trim()) // Lấy phần cuối (tỉnh/thành phố)
                .filter((value, index, self) => self.indexOf(value) === index); // Loại bỏ trùng lặp
            //console.log(uniqueProvinces);
            const suggestedProvinces = uniqueProvinces.filter((province) => {
                return (
                    regex.test(province)
                );
            })
            //console.log(suggestedProvinces);
            // const addresses = await Hotel.find({
            //     hotelAddress: { $regex: new RegExp(filter.filter, 'i') } // Tìm các địa chỉ có từ "Bình"
            // }).distinct("hotelAddress"); // Chỉ lấy các địa chỉ duy nhất

            // const suggestions = addresses
            //     .map((address) => address.split(',').pop().trim()) // Lấy phần tỉnh/thành phố
            //     .filter((value, index, self) => self.indexOf(value) === index); // Loại bỏ trùng lặp

            //console.log(suggestions);
            resolve({
                status: 'OK',
                message: 'Lọc khách sạn thành công',
                data: suggestedHotels,
                provinces: suggestedProvinces
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
    filterHotel,
    suggestedHotel
}