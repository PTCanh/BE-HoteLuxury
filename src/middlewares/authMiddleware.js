import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


export const authMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(401).json({
                message: 'The authentication',
                status: 'ERROR'
            })
        }
        if(user?.roleId === 'R1'){
            next()
        }else{
            return res.status(401).json({
                message: 'The authentication',
                status: 'ERROR'
            })
        }
    })
}

export const authUserMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    const userId = parseInt(req.params.id, 10)
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(401).json({
                message: 'The authentication',
                status: 'ERROR'
            })
        }
        if(user?.roleId === 'R1' || user?.userId === userId){
            next()
        }else{
            return res.status(401).json({
                message: 'The authentication',
                status: 'ERROR'
            })
        }
    })
}