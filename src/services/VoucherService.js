import Voucher from '../models/Voucher.js'
import jwt from 'jsonwebtoken'

const createVoucher = (voucher) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(voucher.discountType === "fixed"){
                const valueString = Number(voucher.discountValue).toLocaleString('vi-VN') + 'đ'
                if(voucher.minOrderValue){
                    const minOrderValueString = Number(voucher.minOrderValue).toLocaleString('vi-VN') + 'đ'
                    voucher.content = `Giảm ${valueString} cho đơn từ ${minOrderValueString}`
                }else{
                    voucher.content = `Giảm ${valueString} cho tất cả đơn`
                }
            }else if(voucher.discountType === "percentage"){
                let maxPercentageDiscountString = "200.000đ"
                if(voucher.maxPercentageDiscount){
                    maxPercentageDiscountString = Number(voucher.maxPercentageDiscount).toLocaleString('vi-VN') + 'đ'
                }
                if(voucher.minOrderValue){
                    const minOrderValueString = Number(voucher.minOrderValue).toLocaleString('vi-VN') + 'đ'
                    voucher.content = `Giảm ${voucher.discountValue}% cho đơn từ ${minOrderValueString} (tối đa ${maxPercentageDiscountString})`
                }else{
                    voucher.content = `Giảm ${voucher.discountValue}% cho tất cả đơn (tối đa ${maxPercentageDiscountString})`
                }
            }
            const newVoucher = await Voucher.create(voucher)
            resolve({
                status: 'OK',
                message: 'Tạo Voucher thành công',
                data: newVoucher,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const updateVoucher = (id, voucher) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkVoucher = await Voucher.findOne({ voucherId: id })
            if (!checkVoucher) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy Voucher',
                    statusCode: 404
                })
            }
            await Voucher.findOneAndUpdate({ voucherId: id }, voucher, { new: true })
            resolve({
                status: 'OK',
                message: 'Cập nhật Voucher thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteVoucher = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkVoucher = await Voucher.findOne({ voucherId: id })
            if (!checkVoucher) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy Voucher',
                    statusCode: 404
                })
            }
            await Voucher.findOneAndDelete({ voucherId: id })
            resolve({
                status: 'OK',
                message: 'Xóa Voucher thành công',
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailVoucher = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkVoucher = await Voucher.findOne({ voucherId: id })
            if (!checkVoucher) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy Voucher',
                    statusCode: 404
                })
            }
            resolve({
                status: 'OK',
                message: 'Lấy chi tiết Voucher thành công',
                data: checkVoucher,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getAllVoucher = (headers) => {
    return new Promise(async (resolve, reject) => {
        try {
            const now = new Date();
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            let checkVoucher = await Voucher.find({
                userId: decoded.userId,
                quantity: { $gte: 1 },
                expiredAt: { $gt: now }
            })
            checkVoucher = checkVoucher.sort((a, b) => {
                return b.createdAt - a.createdAt;
            })

            resolve({
                status: 'OK',
                message: 'Xem tất cả Voucher thành công',
                data: checkVoucher,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
            console.log(e)
        }
    })
}

const getSuitableVoucher = (headers, query) => {
    return new Promise(async (resolve, reject) => {
        try {
            const price = Number(query.price)
            const now = new Date();
            const token = headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
            let checkVoucher = await Voucher.find({
                userId: decoded.userId,
                minOrderValue: {$lte: price},
                quantity: { $gte: 1 },
                expiredAt: { $gt: now }
            }).sort({ createdAt: -1 });

            resolve({
                status: 'OK',
                message: 'Xem Voucher phù hợp thành công',
                data: checkVoucher,
                statusCode: 200
            })

        } catch (e) {
            reject(e)
        }
    })
}

export default {
    createVoucher,
    updateVoucher,
    deleteVoucher,
    getDetailVoucher,
    getAllVoucher,
    getSuitableVoucher
}