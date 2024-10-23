import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const commentSchema = new Schema({
    commentId: {
        type: Number,
        unique: true
    },
    userId: {
        type: Number,
        required: true
    },
    commentContent: {
        type: String,
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

commentSchema.plugin(AutoIncrement, { inc_field: 'commentId', start_seq: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;