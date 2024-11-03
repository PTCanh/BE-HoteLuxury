import jwt from "jsonwebtoken"
import Cart from '../models/Cart.js'
import RoomType from '../models/RoomType.js'
import Hotel from '../models/Hotel.js'

const addToCart = (cart, access_token) => {
    return new Promise(async (resolve, reject) => {
        const token = access_token.split(' ')[1]
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        try {
            
            const checkCart = await Cart.findOne({
                roomTypeId: cart.roomTypeId
            });

            if (checkCart !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The RoomType already exists'
                });
            }
            await Cart.create({
                userId: decoded.userId,
                roomTypeId: cart.roomTypeId
            })
            
            resolve({
                status: 'OK',
                message: 'Create Cart successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

// const updateCart = (cart, id) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const checkCart = await Cart.findOne({
//                 cartId: id
//             })
//             if (checkCart === null) {
//                 return resolve({
//                     status: 'ERR',
//                     message: 'The Cart is not exist'
//                 })
//             }

//             await Cart.findOneAndUpdate({ CartId: id },
//                 cart,
//                 { new: true })
//             resolve({
//                 status: 'OK',
//                 message: 'Update Cart successfully',
//             })

//         } catch (e) {
//             reject(e)
//         }
//     })
// }

const deleteRoomTypeFromCart = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkCart = await Cart.findOne({
                cartId: id
            })
            if (checkCart === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Cart is not exist'
                })
            }
            //delete schedule

            await Cart.findOneAndDelete({ cartId: id },
                { new: true })

            resolve({
                status: 'OK',
                message: 'Delete RoomType form Cart successfully',
            })

        } catch (e) {
            reject(e)
        }
    })
}

const getDetailCart = (access_token) => {
    return new Promise(async (resolve, reject) => {
        const token = access_token.split(' ')[1]
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        try {
            const checkCart = await Cart.find({
                userId: decoded.userId
            })
            if (checkCart === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Cart is not exist'
                })
            }

            resolve({
                status: 'OK',
                message: 'Get detail Cart successfully',
                data: checkCart
            })

        } catch (e) {
            reject(e)
        }
    })
}

// const getAllCart = () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const checkCart = await Cart.find()
//             if (checkCart.length === 0) {
//                 return resolve({
//                     status: 'ERR',
//                     message: 'The Cart is empty'
//                 })
//             }

//             resolve({
//                 status: 'OK',
//                 message: 'Get all Cart successfully',
//                 data: checkCart
//             })

//         } catch (e) {
//             reject(e)
//         }
//     })
// }

// const searchCart = (header) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             // if (!query.CartStatus) {
//             //     return resolve({
//             //         status: 'ERR',
//             //         message: 'The Cart status is required'
//             //     })
//             // }
//             //const CartStatus = query.CartStatus.replace(/\s+/g, ' ').trim()
//             // const checkCart = await Cart.find({
//             //     CartStatus: { $regex: new RegExp(`^${CartStatus}$`, 'i') } // Không phân biệt hoa thường
//             // });
//             // if (checkCart.length === 0) {
//             //     return resolve({
//             //         status: 'ERR',
//             //         message: `The Cart is not found`
//             //     })
//             // }

//             resolve({
//                 status: 'OK',
//                 message: 'Search Cart successfully',
//                 //data: checkCart
//             })

//         } catch (e) {
//             reject(e)
//         }
//     })
// }

export default {
    addToCart,
    //updateCart,
    deleteRoomTypeFromCart,
    getDetailCart,
    //getAllCart,
    //searchCart
}