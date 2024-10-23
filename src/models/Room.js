import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const roomSchema = new Schema({
    roomId: {
        type: Number,
        unique: true
    },
    roomTypeId: {
        type: Number,
        required: true
    },
    roomNumber: {
        type: Number,
        required: true
    },
    roomStatus: {
        type: String,
        required: true
    }
});

roomSchema.plugin(AutoIncrement, { inc_field: 'roomId', start_seq: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;