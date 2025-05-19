import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const roomTypeSchema = new Schema({
    roomTypeId: {
        type: Number,
        unique: true
    },
    hotelId: {
        type: Number,
        required: true
    },
    roomTypeQuantity: {
        type: Number,
    },
    // roomEmptyQuantity: {
    //     type: Number,
    //     required: true
    // },
    roomTypeName: {
        type: String,
        required: true
    },
    roomTypePrice: {
        type: String,
        required: true
    },
    roomTypeImage: {
        type: String,
        required: true
    },
    roomTypeImages: {
        type: [String],
        required: true
    },
    adultQuantity: {
        type: Number,
        required: true
    },
    childQuantity: {
        type: Number,
        required: true
    },
    roomTypeDescription: {
        type: String,
        required: true
    },
    roomTypeWeekendPrice: {
        type: String,
        required: true
    }
});

roomTypeSchema.plugin(AutoIncrement, { inc_field: 'roomTypeId', start_seq: 1 });

const RoomType = mongoose.model('RoomType', roomTypeSchema);

export default RoomType;