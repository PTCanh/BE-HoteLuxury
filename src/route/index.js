import homePageRouter from "./web.js"
import userRouter from "./UserRouter.js"
import adminRouter from "./AdminRouter.js"
import hotelRouter from "./HotelRouter.js"
import roomTypeRouter from "./RoomTypeRouter.js"
import roomRouter from "./RoomRouter.js"
import locationRouter from "./LocationRouter.js"

const routes = (app) => {
    app.use('/', homePageRouter)
    app.use('/user', userRouter)
    app.use('/admin',adminRouter)
    app.use('/hotel',hotelRouter)
    app.use('/room-type',roomTypeRouter)
    app.use('/room',roomRouter)
    app.use('/location',locationRouter)
}

export default routes