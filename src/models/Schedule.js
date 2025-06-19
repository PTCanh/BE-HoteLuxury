import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const scheduleSchema = new Schema({
    scheduleId: {
        type: Number,
        unique: true
    },
    roomId: {
        type: Number,
        required: true
    },
    bookingId: {
        type: Number,
        required: true
    },
    // roomStatus: {
    //     type: String,
    //     required: true
    // },
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
    timestamps:true
});

scheduleSchema.plugin(AutoIncrement, { inc_field: 'scheduleId', start_seq: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;