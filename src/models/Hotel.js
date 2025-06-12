import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const hotelSchema = new Schema({
    hotelId: {
        type: Number,
        unique: true
    },
    userId: {
        type: Number,
        required: true
    },
    hotelName: {
        type: String,
        required: true
    },
    hotelAddress: {
        type: String,
        required: true
    },
    hotelStar: {
        type: Number,
        required: true
    },
    hotelType: {
        type: String,
        required: true
    },
    hotelDescription: {
        type: String,
        required: true
    },
    hotelImage: {
        type: String,
        required: true
    },
    hotelImages: {
        type: [String], // Array of strings to store multiple image URLs
        required: true
    },
    hotelPhoneNumber: {
        type: String,
        required: true
    },
    ratingAverage: {
        type: Number,
        default: 0
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    locationId: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    }
});

hotelSchema.plugin(AutoIncrement, { inc_field: 'hotelId', start_seq: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;