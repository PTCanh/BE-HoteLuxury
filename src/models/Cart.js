import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const cartSchema = new Schema({
    cartId: {
        type: Number,
        unique: true
    },
    userId: {
        type: Number,
        required: true
    },
    roomId: {
        type: Number,
        required: true
    }
});

cartSchema.plugin(AutoIncrement, { inc_field: 'cartId', start_seq: 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;