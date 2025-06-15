import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const voucherSchema = new Schema({
    voucherId: {
        type: Number,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    userId: {
        type: Number
    },
    hotelId: {
        type: Number
    },
    discountType: {
        type: String,
        required: true,
        enum: ["percentage", "fixed"]
    },
    discountValue: {
        type: Number,
        required: true
    },
    minOrderValue: {
        type: Number,
        default: 1
    },
    maxPercentageDiscount: {
        type: Number,
        default: 200000
    },
    expiredAt: {
        type: Date,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    startedAt:{
        type: Date
    }
},
{
    timestamps: true
});

voucherSchema.plugin(AutoIncrement, { inc_field: 'voucherId', start_seq: 1 });

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;