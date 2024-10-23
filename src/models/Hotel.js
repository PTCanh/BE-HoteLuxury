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
    hotelDescription: {
        type: String,
        required: true
    },
    hotelImage: {
        type: String,
        required: true
    },
    hotelPhoneNumber: {
        type: Number,
        required: true
    },
    ratingAverage: {
        type: Number,
        required: true
    },
    ratingQuantity: {
        type: Number,
        required: true
    },
    locationId: {
        type: Number,
        required: true
    }
});

hotelSchema.plugin(AutoIncrement, { inc_field: 'hotelId', start_seq: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;