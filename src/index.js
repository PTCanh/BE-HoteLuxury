import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from "http";
import routers from './route/index.js';
import connectDB from './config/connectDB.js';
import { setupSocket } from "./config/socket.js";
import path from 'path';
import './config/voucherScheduler.js'; // ✅ Import để chạy cron job

import dotenv from 'dotenv';
dotenv.config();

let app = express();
const server = http.createServer(app);
const { io, connectedPartners } = setupSocket(server);

// Make io & connectedPartners accessible in routes
app.set("io", io);
app.set("connectedPartners", connectedPartners);

app.use(cors({
    //origin: "https://hoteluxury.vercel.app", // Frontend URL
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

routers(app);

connectDB();

let port = process.env.PORT || 9000;

server.listen(port, () => {
    // callback
    console.log("Backend Nodejs is running on the port: " + port);
})