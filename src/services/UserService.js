import User from '../models/User.js'
import bcrypt from 'bcrypt'
import { generalAccessToken, generalRefreshToken, generalResetPasswordToken } from './JwtService.js'
import dotenv from 'dotenv'
import sendMail from '../utils/sendMail.js'
dotenv.config()

export const createUserService = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { fullname, email, password, roleId, phoneNumber, birthDate, gender, address, image } = newUser
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser !== null) {
                return resolve({
                    status: 'ERR3',
                    message: 'The email is already exists!'
                })
            }
            const hash = bcrypt.hashSync(password, 10)
            const createdUser = await User.create({
                fullname,
                email,
                password: hash,
                phoneNumber,
                birthDate,
                roleId,
                gender,
                address,
                image,
                isVerified: true
            })
            if (createdUser) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdUser
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

export const loginUserService = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The email is not defined'
                })
            } else {
                if (!checkUser.isVerified) {
                    return resolve({
                        status: 'ERR2',
                        message: 'The email is not verified'
                    })
                }
            }
            const comparePassword = bcrypt.compareSync(password, checkUser.password)

            if (!comparePassword) {
                return resolve({
                    status: 'ERR',
                    message: 'The user or password is incorrect',
                })
            }

            const access_token = await generalAccessToken({
                userId: checkUser.userId,
                roleId: checkUser.roleId
            })

            const refresh_token = await generalRefreshToken({
                userId: checkUser.userId,
                roleId: checkUser.roleId
            })

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token,
                roleId: checkUser.roleId,
                userId: checkUser.userId,
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const resetUserPasswordService = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkEmail = await User.findOne({
                email: email
            })
            if (checkEmail === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The email is not defined'
                })
            }

            // Create reset password token
            const token = await generalResetPasswordToken(email);
            // Create reset password link
            const resetLink = `${process.env.WEB_LINK}/user/reset-password/${token}`;
            // Create text
            const text = `Click the link to reset your password: ${resetLink}`
            const subject = 'Reset password'
            sendMail(email, text, subject)

            resolve({
                status: 'OK',
                message: 'Password reset link has been sent to your email',
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const updateUserService = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                userId: id
            })
            if (checkUser === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }
            if (data.password) {
                data.password = bcrypt.hashSync(data.password, 10)
            }
            const updatedUser = await User.findOneAndUpdate(
                { userId: id },  // Điều kiện tìm kiếm
                data,  // Giá trị cần cập nhật
                { new: true }
            )
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedUser
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const deleteUserService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                userId: id
            })
            if (checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            await User.findOneAndDelete({ userId: id })
            resolve({
                status: 'OK',
                message: 'Delete user success',
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const getAllUserService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUsers = await User.find()
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUsers
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const getDetailsUserService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({
                userId: id
            })
            if (user === null) {
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'Success',
                data: user
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const filterUserService = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const formatFilter = {}
            if (filter.email) {
                formatFilter.email = filter.email.replace(/\s+/g, ' ').trim()
                formatFilter.email = { $regex: new RegExp(formatFilter.email, 'i') } // Không phân biệt hoa thường
            }
            if (filter.fullname) {
                formatFilter.fullname = filter.fullname.replace(/\s+/g, ' ').trim()
                formatFilter.fullname = { $regex: new RegExp(formatFilter.fullname, 'i') } // Không phân biệt hoa thường
            }
            if (filter.phoneNumber) {
                formatFilter.phoneNumber = filter.phoneNumber.replace(/\s+/g, ' ').trim()
                formatFilter.phoneNumber = { $regex: new RegExp(formatFilter.phoneNumber) }
            }
            if (filter.roleId) {
                formatFilter.roleId = filter.roleId.replace(/\s+/g, ' ').trim()
                formatFilter.roleId = { $regex: new RegExp(formatFilter.roleId, 'i') }
            }
            if (filter.birthDate) {
                formatFilter.birthDate = filter.birthDate
            }
            const filterUser = await User.find(formatFilter);
            if (filterUser.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: `The User is not found`
                })
            }
            resolve({
                status: 'OK',
                message: 'Filter User successfully',
                data: filterUser
            })

        } catch (e) {
            reject(e)
        }
    })
}

export const getAllHotelManagerService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUsers = await User.find({
                roleId:"R2"
            })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUsers
            })

        } catch (e) {
            reject(e)
        }
    })
}