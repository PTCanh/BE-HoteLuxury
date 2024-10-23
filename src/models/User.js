import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const userSchema = new Schema({
    userId: {
        type: Number,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
    },
    address: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    birthDate: {
        type: Date
    },
    roleId: {
        type: String,
        default: 'R3'
    },
    phoneNumber: {
        type: Number
    },
    image: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpCode: {
        type: String
    }
});
userSchema.plugin(AutoIncrement, { inc_field: 'userId', start_seq: 1 });

const User = mongoose.model('Users', userSchema);

export default User;