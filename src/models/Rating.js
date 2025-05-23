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
    ratingDescription: {
        type: String,
        required: true
    },
    ratingDate: {
        type: Date,
        required: true
    },
    hotelId: {
        type: Number,
        required: true
    },
    ratingImages: {
        type: [String], // Array of strings to store multiple image URLs
        required: true
    }
},
{
    timestamps: true
});

ratingSchema.plugin(AutoIncrement, { inc_field: 'ratingId', start_seq: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;