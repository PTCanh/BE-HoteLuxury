import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const notableLocationSchema = new Schema({
    notableLocationId: {
        type: Number,
        unique: true
    },
    locationImage: {
        type: String,
        required: true
    },
    locationName: {
        type: String,
        required: true
    }
});

notableLocationSchema.plugin(AutoIncrement, { inc_field: 'notableLocationId', start_seq: 1 });

const NotableLocation = mongoose.model('NotableLocation', notableLocationSchema);

export default NotableLocation;