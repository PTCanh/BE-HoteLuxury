import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const notificationSchema = new Schema({
    notificationId: {
        type: Number,
        unique: true
    },
    userId: {
        type: Number
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

notificationSchema.plugin(AutoIncrement, { inc_field: 'notificationId', start_seq: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;