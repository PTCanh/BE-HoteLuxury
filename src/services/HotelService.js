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
                hotelId: id,
                isDeleted: false
            })
            if (checkHotel === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Khách sạn không tồn tại',
                    statusCode: 404
                })
            }

            await Hotel.findOneAndUpdate({ hotelId: id, isDeleted: false },
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
                hotelId: id,
                isDeleted: false
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
                hotelId: id,
                isDeleted: false
            }).populate({
                path: "locationId",
                model: "Location",
                localField: "locationId",
                foreignField: "locationId",
                select: "locationName",
            }).lean()
            if (checkHotel === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Khách sạn không tồn tại',
                    statusCode: 404
                })
            }
            checkHotel.locationName = checkHotel.locationId?.locationName || ''
            checkHotel.locationId = checkHotel.locationId?.locationId || ''
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
                    userId: decoded.userId,
                    isDeleted: false
                })
                return resolve({
                    status: 'OK',
                    message: 'Xem tất cả khách sạn thành công',
                    data: checkHotel
                })
            }
            checkHotel = await Hotel.find({ isDeleted: false })
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

function normalizeVietnamese(str) {
    return str
        .normalize("NFD")                     // Tách chữ + dấu
        .replace(/[\u0300-\u036f]/g, "")     // Xoá dấu
        .replace(/đ/g, "d")                  // đ → d
        .replace(/Đ/g, "D")                  // Đ → D
        .replace(/[^a-zA-Z0-9\s]/g, "")      // Loại bỏ ký tự đặc biệt (ngoại trừ chữ, số và khoảng trắng)
        .replace(/\s+/g, " ")                // Thay nhiều khoảng trắng bằng dấu gạch ngang
        .toLowerCase()                       // Viết thường hết
        .trim();                             // Bỏ khoảng trắng đầu/cuối (tránh dấu `-` thừa)
}

const searchHotel = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!filter.dayStart) {
                filter.dayStart = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
            }
            if (!filter.dayEnd) {
                filter.dayEnd = new Date(Date.now() + (24 + 7) * 60 * 60 * 1000).toISOString().split('T')[0];
            }
            if (!filter.adultQuantity) {
                filter.adultQuantity = 1
            }
            if (!filter.childQuantity) {
                filter.childQuantity = 0
            }
            if (!filter.currentRooms) {
                filter.currentRooms = 1
            }
            if (!filter.dayStart || !filter.dayEnd) {
                return resolve({
                    status: 'ERR',
                    message: `dayStart và dayEnd phải có`,
                    statusCode: 404
                })
            }

            // Bộ lọc
            const formatFilter = normalizeVietnamese(filter.filter || '').toLowerCase().trim()
            const regex = new RegExp(formatFilter, 'i');
            //Khách sạn đã tìm kiếm
            const hotels = await Hotel.find({ isDeleted: false })
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
                    regex.test(normalizeVietnamese(hotel.locationName || '').toLowerCase()) ||
                    regex.test(normalizeVietnamese(hotel.hotelName || '').toLowerCase()) ||
                    regex.test(normalizeVietnamese(hotel.hotelAddress || '').toLowerCase())
                );
            });

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
                hotelId: { $in: checkHotelIds },
                $expr: {
                    $and: [
                        { $gte: ["$adultQuantity", filter.adultQuantity] },
                        {
                            $gte: [
                                { $add: ["$adultQuantity", "$childQuantity"] },
                                parseInt(filter.adultQuantity) + parseInt(filter.childQuantity)
                            ]
                        }
                    ]
                }
            });
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
            //Gộp roomTypeId và currentRooms thành Object
            const result = Object.values(
                availableRoomTypeIds.reduce((acc, roomTypeId) => {
                    if (!acc[roomTypeId]) {
                        acc[roomTypeId] = { roomTypeId, currentRooms: 1 };
                    } else {
                        acc[roomTypeId].currentRooms += 1;
                    }
                    return acc;
                }, {})
            );
            //Tìm object có roomTypeId còn đủ phòng
            const filterResult = result.filter((roomtype) => {
                return roomtype.currentRooms >= filter.currentRooms;
            });
            //Map thành mảng roomTypeId
            const filterResultIds = filterResult.map(roomtype => roomtype.roomTypeId)
            //Tìm những roomType của các phòng trống
            const availableRoomTypes = await RoomType.find({
                roomTypeId: { $in: filterResultIds }
            })
            //Tính giá nhỏ nhất của từng khách sạn
            const dayStart = new Date(filter.dayStart)
            const dayEnd = new Date(filter.dayEnd)
            let minPriceOfHotels = {}
            let dayFlag = 0 // Không có ngày trong tuần
            for (let d = new Date(dayStart); d < dayEnd; d.setDate(d.getDate() + 1)) {
                const day = d.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
                if (day === 1 || day === 2 || day === 3 || day === 4) {
                    dayFlag = 1 // Có ngày trong tuần
                }
            }
            if (dayFlag === 1) {
                availableRoomTypes.forEach((roomType) => {
                    if (!minPriceOfHotels[roomType.hotelId]) {
                        minPriceOfHotels[roomType.hotelId] = roomType.roomTypePrice
                    } else {
                        if (Number(minPriceOfHotels[roomType.hotelId]) > Number(roomType.roomTypePrice)) {
                            minPriceOfHotels[roomType.hotelId] = roomType.roomTypePrice
                        }
                    }
                })
            } else {
                availableRoomTypes.forEach((roomType) => {
                    if (!minPriceOfHotels[roomType.hotelId]) {
                        minPriceOfHotels[roomType.hotelId] = roomType.roomTypeWeekendPrice
                    } else {
                        if (Number(minPriceOfHotels[roomType.hotelId]) > Number(roomType.roomTypeWeekendPrice)) {
                            minPriceOfHotels[roomType.hotelId] = roomType.roomTypeWeekendPrice
                        }
                    }
                })
            }

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
                hotelId: { $in: availableHotelIds },
                isDeleted: false
            }).lean()
            //Tìm những hotel hết phòng
            const noAvailableHotels = await Hotel.find({
                hotelId: { $in: noAvailableHotelIds },
                isDeleted: false
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
            const searchedHotels = searchedHotel.data
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
                hotelName: filter.hotelName ? normalizeVietnamese(filter.hotelName).toLowerCase().trim() : '',
                hotelType: filter.hotelType ? filter.hotelType.split(',') : null,
                hotelStar: filter.hotelStar ? filter.hotelStar.split(',') : null,
                minPrice: filter.minPrice ? filter.minPrice.split('-') : null,
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
                    (!formatFilter.hotelName || (hotel.hotelName && normalizeVietnamese(hotel.hotelName).toLowerCase().includes(formatFilter.hotelName))) &&
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
            formatFilter.isDeleted = false
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
            const hotels = await Hotel.find({ isDeleted: false })
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

const getSimilarHotel = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkHotel = await Hotel.findOne({
                hotelId: id,
                isDeleted: false
            })
            if (checkHotel === null) {
                return resolve({
                    status: 'ERR',
                    message: 'Khách sạn không tồn tại',
                    statusCode: 404
                })
            }
            const similarHotels = await Hotel.find({
                hotelType: checkHotel.hotelType,
                hotelStar: checkHotel.hotelStar,
                locationId: checkHotel.locationId,
                isDeleted: false,
                hotelId: { $ne: id }
            }).limit(4)

            resolve({
                status: 'OK',
                message: 'Lấy khách sạn tương tự thành công',
                data: similarHotels,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getTop12MostBookingHotel = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const now = new Date()
            const filterStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const filterEnd = new Date(now.getFullYear(), now.getMonth(), 0)

            let top12MostBookingHotel = await Booking.aggregate([
                {
                    $match: {
                        isConfirmed: true,
                        status: { $in: ['Đã thanh toán', 'Chưa thanh toán'] },
                        dayEnd: { $gte: filterStart, $lte: filterEnd }
                    }
                },
                {
                    $lookup: {
                        from: 'roomtypes',
                        let: { roomTypeId: '$roomTypeId' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$roomTypeId', '$$roomTypeId'] } } }
                        ],
                        as: 'roomType'
                    }
                },
                { $unwind: '$roomType' },
                {
                    $lookup: {
                        from: 'hotels',
                        let: { hotelId: '$roomType.hotelId' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$hotelId', '$$hotelId'] } } }
                        ],
                        as: 'hotel'
                    }
                },
                { $unwind: '$hotel' },
                {
                    $lookup: {
                        from: 'locations',
                        let: { locationId: '$hotel.locationId' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$locationId', '$$locationId'] } } }
                        ],
                        as: 'location'
                    }
                },
                { $unwind: '$location' },
                {
                    $group: {
                        _id: '$roomType.hotelId',
                        hotelId: { $first: '$roomType.hotelId' },
                        hotelName: { $first: '$hotel.hotelName' },
                        hotelImage: { $first: '$hotel.hotelImage' },
                        locationName: { $first: '$location.locationName' },
                        totalBooking: { $sum: 1 },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotelId: 1,
                        hotelName: 1,
                        hotelImage: 1,
                        locationName: 1,
                        totalBooking: 1,
                    }
                },
                {
                    $sort: { totalBooking: -1 }
                },
                { $limit: 12 }
            ]);

            if (top12MostBookingHotel.length < 12) {
                const hotelIds = top12MostBookingHotel.map(hotel => hotel.hotelId)
                const others = 12 - top12MostBookingHotel.length
                const otherHotels = await Hotel.find({
                    hotelId: {$nin: hotelIds}
                })
                    .populate({
                        path: "locationId",
                        model: "Location",
                        localField: "locationId",
                        foreignField: "locationId",
                        select: "locationName",
                    }).lean().limit(others)
                const otherTopHotels = otherHotels.map(hotel => {
                    return {
                        hotelId: hotel.hotelId,
                        hotelName: hotel.hotelName,
                        hotelImage: hotel.hotelImage,
                        locationName: hotel.locationId?.locationName || null,
                        totalBooking: 0,
                    }
                })
                const mergedArray = [...top12MostBookingHotel, ...otherTopHotels];

                return resolve({
                    status: 'OK',
                    message: 'Lấy 12 khách sạn đặt nhiều nhất thành công',
                    data: mergedArray,
                    statusCode: 200
                })

            }

            resolve({
                status: 'OK',
                message: 'Lấy 12 khách sạn đặt nhiều nhất thành công',
                data: top12MostBookingHotel,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
            console.log(e)
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
    suggestedHotel,
    getSimilarHotel,
    getTop12MostBookingHotel
}