import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


export const authMiddleware = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(401).json({
            message: 'The token is empty',
            status: 'ERROR'
        })
    }
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'ERROR'
            })
        }
        if(user?.roleId === 'R1'){
            next()
        }else{
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'ERR'
            })
        }
    })
}

export const authHotelManagerMiddleware = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(401).json({
            message: 'The token is empty',
            status: 'ERROR'
        })
    }
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'ERROR'
            })
        }
        if(user?.roleId === 'R2' || user?.roleId === 'R1'){
            next()
        }else{
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'ERR'
            })
        }
    })
}

export const authUserMiddleware = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(401).json({
            message: 'The token is empty',
            status: 'ERROR'
        })
    }
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'ERROR'
            })
        }
        if(user?.roleId === 'R3' || user?.roleId === 'R2'){
            next()
        }else{
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'ERR'
            })
        }
    })
}
export const verifyToken = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(401).json({
            message: 'The token is empty',
            status: 'ERROR'
        })
    }
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'ERROR'
            })
        }
        next()
    })
}