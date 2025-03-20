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
        enum: ['Nam', 'Nữ']
    },
    birthDate: {
        type: Date
    },
    roleId: {
        type: String,
        default: 'R3'
    },
    phoneNumber: {
        type: String
    },
    image: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isConfirmed: {
        type: Boolean,
        default: true
    },
    active: {
        type: Boolean,
        default: true
    },
    otpCode: {
        type: String
    },
    refreshToken: {
        type: String
    }
},
{
    timestamps:true
});
userSchema.plugin(AutoIncrement, { inc_field: 'userId', start_seq: 1 });

const User = mongoose.model('Users', userSchema);

export default User;