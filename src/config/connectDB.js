import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectMongoDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/HoteLuxury");
        //await mongoose.connect(process.env.MONGO_ATLAS_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

export default connectMongoDB

