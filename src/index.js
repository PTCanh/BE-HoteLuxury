import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routers from './route/index.js';
import connectDB from './config/connectDB.js';

import dotenv from 'dotenv';
dotenv.config();

let app = express();

app.use(cors({
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

routers(app);

connectDB();

let port = process.env.PORT || 9000;

app.listen(port, () => {
    // callback
    console.log("Backend Nodejs is running on the port: " + port);
})