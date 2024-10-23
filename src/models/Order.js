import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const orderSchema = new Schema({
    orderId: {
        type: Number,
        unique: true
    },
    bookingId: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        required: true
    }
});

orderSchema.plugin(AutoIncrement, { inc_field: 'orderId', start_seq: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;