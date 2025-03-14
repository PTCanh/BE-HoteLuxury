import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import dotenv from 'dotenv'
import sendMail from '../utils/SendMail.js'
dotenv.config()

export const generalAccessToken = async (payload) => {
    const access_token = jwt.sign({
        ...payload
    }, process.env.ACCESS_TOKEN, { expiresIn: '5m' })

    return access_token
}

export const generalRefreshToken = async (payload) => {
    const refresh_token = jwt.sign({
        ...payload
    }, process.env.REFRESH_TOKEN, { expiresIn: '1d' })

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
                email: decoded.email,
                newPassword: tempPassword
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
                    return resolve({
                        status: 'ERR',
                        message: 'The email is already exists!',
                        statusCode: 404
                    })
                } else {

                    await User.findOneAndUpdate(
                        { email: email },  // Điều kiện tìm kiếm
                        { otpCode: hashedOTP },  // Giá trị cần cập nhật
                        { new: true }
                    )

                    await sendMail(email, text, subject)
                    return resolve({
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
                return resolve({
                    status: 'ERR',
                    message: 'The otp is required!',
                    errors: [{
                        field: "otpCode",
                        message: "OTP không được bỏ trống"
                    }],
                    statusCode: "422"
                })
            }
            if (!compareOTP) {
                return resolve({
                    status: 'ERR1',
                    message: 'The otp is wrong!',
                    errors: [{
                        field: "otpCode",
                        message: "OTP không chính xác"
                    }],
                    statusCode: "422"
                })
            } else {
                await User.findOneAndUpdate(
                    { email: email },  // Điều kiện tìm kiếm
                    { isVerified: true },  // Giá trị cần cập nhật
                    { new: true }
                )
                resolve({
                    status: 'OK',
                    message: 'Verify successfully',
                    statusCode: 200
                })
            }

        } catch (e) {
            reject({
                status: 'ERROR',
                message: e
            })
        }
    })
}

export const refreshTokenJwtService = async (refreshToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            const decoded = jwt.decode(refreshToken, process.env.REFRESH_TOKEN)
            const checkUser = await User.findOne({ userId: decoded.userId })
            if (!checkUser) {
                return resolve({
                    status: 'ERR',
                    message: 'Không tìm thấy user',
                    statusCode: 401
                })
            }
            const compareToken = bcrypt.compareSync(refreshToken, checkUser.refreshToken)
            if (!compareToken) {
                return resolve({
                    statusCode: 401,
                    message: 'Token không hợp lệ'
                })
            }
            // const decoded_access_token = jwt.decode(accessToken, process.env.ACCESS_TOKEN)
            // if(!decoded_access_token.userId || (decoded_access_token.userId != decoded.userId)){
            //     return resolve({
            //         statusCode: 401,
            //         message: 'Token không hợp lệ'
            //     })
            // }
            const access_token = await generalAccessToken({
                userId: checkUser.userId,
                roleId: checkUser.roleId
            })
            const refresh_token = jwt.sign(
                { userId: decoded.userId, roleId: decoded.roleId },
                process.env.REFRESH_TOKEN,
                { expiresIn: `${decoded.exp - Math.floor(Date.now() / 1000)}s` } // Set remaining time
            );
            const hashedToken = bcrypt.hashSync(refresh_token, 10)
            await User.findOneAndUpdate({ userId: checkUser.userId },
                { refreshToken: hashedToken },
                { new: true }
            )
            return resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token,
                statusCode: 200
            })
        } catch (e) {
            reject(e)
        }
    })
}

export const logoutUserService = async (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    return resolve({
                        status: 'ERROR',
                        message: 'The authentication',
                        statusCode: "401"
                    })
                }
                const checkUser = await User.findOne({ userId: user.userId })
                await User.findOneAndUpdate({ userId: user.userId },
                    { refreshToken: '' },
                    { new: true }
                )
                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    statusCode: 200
                })
            })


        } catch (e) {
            reject(e)
        }
    })
}