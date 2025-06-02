import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const pointHistorySchema = new Schema({
    pointHistoryId: {
        type: Number,
        unique: true
    },
    userId: {
        type: Number,
        required: true
    },
    point: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isPlus: {
        type: Boolean,
        default: true
    },
    currentPoint: {
        type: Number,
        required: true
    },
},
{
    timestamps: true
});

pointHistorySchema.plugin(AutoIncrement, { inc_field: 'pointHistoryId', start_seq: 1 });

const PointHistory = mongoose.model('PointHistory', pointHistorySchema);

export default PointHistory;