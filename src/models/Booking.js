import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const bookingSchema = new Schema({
    bookingId: {
        type: Number,
        unique: true
    },
    roomTypeId: {
        type: Number,
        required: true
    },
    userId: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    roomQuantity: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    isConfirmed: {
        type: Boolean,
        required: true,
        default:"false"
    },
    status: {
        type: String,
        required: true,
        default:"Chưa thanh toán"
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    dayStart: {
        type: Date,
        required: true
    },
    dayEnd: {
        type: Date,
        required: true
    }
},
{
    timestamps: true
});


bookingSchema.plugin(AutoIncrement, { inc_field: 'bookingId', start_seq: 1 });
const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;