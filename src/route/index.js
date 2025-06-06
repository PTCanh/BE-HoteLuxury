import homePageRouter from "./web.js"
import userRouter from "./UserRouter.js"
import adminRouter from "./AdminRouter.js"
import hotelRouter from "./HotelRouter.js"
import roomTypeRouter from "./RoomTypeRouter.js"
import roomRouter from "./RoomRouter.js"
import locationRouter from "./LocationRouter.js"
import bookingRouter from "./BookingRouter.js"
import cartRouter from "./CartRouter.js"
import scheduleRouter from "./ScheduleRouter.js"
import ratingRouter from "./RatingRouter.js"
import notificationRouter from "./NotificationRouter.js"
import pointHistoryRouter from "./PointHistoryRouter.js"
import voucherRouter from "./VoucherRouter.js"

const routes = (app) => {
    app.use('/auth', homePageRouter)
    app.use('/user', userRouter)
    app.use('/admin',adminRouter)
    app.use('/hotel',hotelRouter)
    app.use('/room-type',roomTypeRouter)
    app.use('/room',roomRouter)
    app.use('/location',locationRouter)
    app.use('/booking',bookingRouter)
    app.use('/cart',cartRouter)
    app.use('/schedule',scheduleRouter)
    app.use('/rating',ratingRouter)
    app.use('/notification',notificationRouter)
    app.use('/point-history',pointHistoryRouter)
    app.use('/voucher',voucherRouter)
}

export default routes