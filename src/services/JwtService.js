import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import dotenv from 'dotenv'
import sendMail from '../utils/sendMail.js'
dotenv.config()

export const generalAccessToken = async (payload) => {
    const access_token = jwt.sign({
        ...payload
    }, process.env.ACCESS_TOKEN, { expiresIn: '24h' })

    return access_token
}

export const generalRefreshToken = async (payload) => {
    const refresh_token = jwt.sign({
        ...payload
    }, process.env.REFRESH_TOKEN, { expiresIn: '365d' })

    return refresh_token
}

export const generalResetPasswordToken = async (email) => {
    const reset_password_token = jwt.sign({
        email: email
    }, process.env.SECRET_KEY, { expiresIn: '15m' })

    return reset_password_token
}

export const generalOTPToken = async (email) => {
    const otp_token = jwt.sign({
        email: email,
        otp: Math.floor(100000 + Math.random() * 900000).toString()
    }, process.env.SECRET_KEY, { expiresIn: '60s' })

    return otp_token
}

export const handleResetPasswordTokenService = async (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const tempPassword = crypto.randomBytes(8).toString('hex').slice(0, 8);
            const hash = bcrypt.hashSync(tempPassword, 10)
            await User.findOneAndUpdate(
                { email: decoded.email },  // Điều kiện tìm kiếm
                { password: hash },  // Giá trị cần cập nhật
                { new: true }
            )
            resolve({
                status: 'OK',
                message: `Token is valid. Your new password of ${decoded.email} is ${tempPassword}`,
            })
        } catch (e) {
            reject(e)
        }
    })
}

export const createAndSendOTPService = async (newUser, otp_token) => {
    return new Promise(async (resolve, reject) => {
        const { fullname, email, password } = newUser
        try {
            const checkUser = await User.findOne({
                email: email
            })
            const decoded = jwt.verify(otp_token, process.env.SECRET_KEY); // Verify and decode the token
            const otpFromToken = decoded.otp; // Extract OTP from the token
            const hashedPassword = bcrypt.hashSync(password, 10)
            const hashedOTP = bcrypt.hashSync(otpFromToken, 10)
            const verifyLink = `${process.env.WEB_LINK}/user/verify-account/${otp_token}`;
            const text = `Your OTP for email verification is: ${otpFromToken}. It is valid for 60 seconds.`
            const subject = 'Verify account'
            if (checkUser !== null) {
                if (checkUser.isVerified) {
                    resolve({
                        status: 'ERR',
                        message: 'The email is already exists!'
                    })
                } else {

                    await User.findOneAndUpdate(
                        { email: email },  // Điều kiện tìm kiếm
                        { otpCode: hashedOTP },  // Giá trị cần cập nhật
                        { new: true }
                    )

                    await sendMail(email, text, subject)
                    resolve({
                        status: 'OK',
                        message: text,
                        otp_token: otp_token, 
                    })
                }
            }

            await User.create({
                fullname,
                email,
                password: hashedPassword,
                otpCode: hashedOTP
            })
            await sendMail(email, text, subject)
            resolve({
                status: 'OK',
                message: text,
                otp_token: otp_token,
            })
        } catch (e) {
            reject(e)
        }
    })
}

export const verifyUserService = async (otpCode, otp_token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const decoded = jwt.verify(otp_token, process.env.SECRET_KEY); // Verify and decode the token
            const email = decoded.email;
            const checkEmail = await User.findOne({
                email: email
            })
            const compareOTP = bcrypt.compareSync(otpCode, checkEmail.otpCode)
            if (!otpCode || otpCode.trim() === '') {
                resolve({
                    status: 'ERR',
                    message: 'The otp is required!'
                })
            }
            if (!compareOTP) {
                resolve({
                    status: 'ERR',
                    message: 'The otp is wrong!'
                })
            } else {
                await User.findOneAndUpdate(
                    { email: email },  // Điều kiện tìm kiếm
                    { isVerified: true },  // Giá trị cần cập nhật
                    { new: true }
                )
                resolve({
                    status: 'OK',
                    message: 'Verify successfully'
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}

export const refreshTokenJwtService = async (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    resolve({
                        status: 'ERROR',
                        message: 'The authentication'
                    })
                }
                const access_token = await generalAccessToken({
                    userId: user?.userId,
                    roleId: user?.roleId
                })
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    access_token
                })
            })


        } catch (e) {
            reject(e)
        }
    })
}