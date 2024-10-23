import homePageRouter from "./web.js"
import userRouter from "./UserRouter.js"

const routes = (app) => {
    app.use('/', homePageRouter)
    app.use('/user', userRouter)
}

export default routes