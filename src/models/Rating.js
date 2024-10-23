import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const ratingSchema = new Schema({
    ratingId: {
        type: Number,
        unique: true
    },
    userId: {
        type: Number,
        required: true
    },
    ratingStar: {
        type: Number,
        required: true
    },
    hotelId: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
});

ratingSchema.plugin(AutoIncrement, { inc_field: 'ratingId', start_seq: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;