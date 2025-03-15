import {
    handleResetPasswordTokenService, refreshTokenJwtService, createAndSendOTPService, generalOTPToken,
    verifyUserService, logoutUserService, handleResetPasswordService
} from '../services/JwtService.js'
import {
    createUserService, loginUserService, updateUserService, deleteUserService, getAllUserService,
    getDetailsUserService, resetUserPasswordService, filterUserService, getAllHotelManagerService, updatePassword,
    hotelManagerDashboardService, googleLoginUserService
} from '../services/UserService.js'

export const createUserController = async (req, res) => {
    try {
        const image = req.file ? `${req.file.filename}` : null;
        const userData = {
            ...req.body,
            image
        }
        const { fullname, email, password, roleId } = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if (!email || !password) {
            return res.status(404).json({
                status: 'ERR1',
                message: 'Không được để trống email và mật khẩu',
                errors: [{
                    field: "email",
                    message: "Không được để trống email và mật khẩu"
                },
                {
                    field: "password",
                    message: "Không được để trống email và mật khẩu"
                }]
            })
        } else if (!isCheckEmail) {
            return res.status(404).json({
                status: 'ERR2',
                message: 'Email sai định dạng',
                errors: [{
                    field: "email",
                    message: "Email sai định dạng"
                }]
            })
        }
        const response = await createUserService(userData)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if (!email || !password) {
            return res.status(422).json({
                status: 'ERR',
                message: 'The input is required',
                errors: [{
                    field: "email",
                    message: "Không được để trống email và mật khẩu"
                }]
            })
        } else if (!isCheckEmail) {
            return res.status(422).json({
                status: 'ERR',
                message: 'The input is not email',
                errors: [{
                    field: "email",
                    message: "Email sai định dạng"
                }]
            })
        }
        const response = await loginUserService(req.body)
        res.cookie('refresh_token', response.refresh_token, {
            HttpOnly: true,
            Secure: true,
            SameSite: 'Strict'
        })
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const logoutUserController = async (req, res) => {
    const token = req.body?.refresh_token
    try {
        if (!token) {
            return res.status(401).json({
                status: 'ERR',
                message: 'Không có token',
                errors: [{
                    field: "",
                    message: ""
                }]
            })
        }
        const response = await logoutUserService(token)
        res.clearCookie('refresh_token')
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const resetUserPasswordController = async (req, res) => {
    try {
        const email = req.body.email
        if (!email) {
            return res.status(422).json({
                status: 'ERR',
                message: 'The email is required',
                errors: [{
                    field: "email",
                    message: "The email is required"
                }]
            })
        }
        const response = await resetUserPasswordService(email)
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const handleResetPasswordTokenController = async (req, res) => {
    const token = req.params.token;
    const otpCode = req.body.otpCode
    try {
        // Verify the token
        const response = await handleResetPasswordTokenService(token, otpCode);
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(401).json({
            message: e
        })
    }
}

export const handleResetPasswordController = async (req, res) => {
    try {
        if(req.body.password != req.body.confirmPassword){
            return res.status(422).json({
                message: "Mật khẩu mới và xác nhận mật khẩu không giống nhau",
                errors: [{
                    field: "confirmPassword",
                    message: "Mật khẩu mới và xác nhận mật khẩu không giống nhau"
                }]
            })
        }
        const response = await handleResetPasswordService(req.body, req.params.token);
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(401).json({
            message: e
        })
    }
}

export const createAndSendOTPController = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if (!email || !password || !confirmPassword) {
            return res.status(422).json({
                status: 'ERR',
                message: 'The input is required',
                errors: [{
                    field: "email",
                    message: "The input is required"
                },
                {
                    field: "password",
                    message: "The input is required"
                },
                {
                    field: "confirmPassword",
                    message: "The input is required"
                }]
            })
        } else if (!isCheckEmail) {
            return res.status(422).json({
                status: 'ERR',
                message: 'The input is not email',
                errors: [{
                    field: "email",
                    message: "The input is not email"
                }]
            })
        } else if (password !== confirmPassword) {
            return res.status(422).json({
                status: 'ERR',
                message: 'Mật khẩu và xác nhận mật khẩu không giống nhau',
                errors: [{
                    field: "confirmPassword",
                    message: "Mật khẩu và xác nhận mật khẩu không giống nhau"
                }]
            })
        }
        const otp_token = await generalOTPToken(req.body.email)
        const response = await createAndSendOTPService(req.body, otp_token);
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const verifyUserController = async (req, res) => {
    const otp_token = req.params.token
    const otpCode = req.body.otpCode
    try {
        const response = await verifyUserService(otpCode, otp_token);
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(401).json(e)
    }
}

export const updateUserController = async (req, res) => {
    try {
        const userId = req.params.id
        const userData = req.body
        const image = req.file ? `${req.file.filename}` : null;
        if (image) {
            userData.image = image
        }
        if (!userId) {
            return res.status(404).json({
                status: 'ERR',
                message: 'The user is required'
            })
        }
        const response = await updateUserService(userId, userData)
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const deleteUserController = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(404).json({
                status: 'ERR',
                message: 'The user is required'
            })
        }
        const response = await deleteUserService(userId)
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const getAllUserController = async (req, res) => {
    try {
        const response = await getAllUserService()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const getDetailsUserController = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(404).json({
                status: 'ERR',
                message: 'The user is required'
            })
        }
        const response = await getDetailsUserService(userId)
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const refreshToken = async (req, res) => {
    try {
        // const authHeader = req.headers?.authorization
        // if (!authHeader) {
        //     return res.status(401).json({
        //         status: 'ERR',
        //         message: 'Access token is required'
        //     })
        // }
        // const parts = authHeader.split(" ");
        // if (parts.length !== 2 || parts[0] !== "Bearer") {
        //     return res.status(401).json({
        //         status: "ERR",
        //         message: "Invalid token format",
        //     });
        // }

        // const access_token = parts[1]

        const token = req.body?.refresh_token
        if (!token) {
            return res.status(401).json({
                status: 'ERR',
                message: 'Refresh token is required'
            })
        }
        const response = await refreshTokenJwtService(token)
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const filterUserController = async (req, res) => {
    try {
        const response = await filterUserService(req.query)
        return res.status(response.statusCode).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const getAllHotelManagerController = async (req, res) => {
    try {
        const response = await getAllHotelManagerService()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const updatePasswordController = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword, confirmPassword } = req.body;

        const result = await updatePassword(userId, oldPassword, newPassword, confirmPassword);
        return res.status(response.statusCode).json(result);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
};

export const hotelManagerDashboardController = async (req, res) => {
    try {
        const response = await hotelManagerDashboardService(req.query.hotelId, req.query)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export const googleLoginUserController = async (req, res) => {
    try {
        const response = await googleLoginUserService(req.body)
        //const { refresh_token, ...newResponse } = response
        res.cookie('refresh_token', response.refresh_token, {
            HttpOnly: true,
            Secure: true,
            SameSite: 'Strict'
        })
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}