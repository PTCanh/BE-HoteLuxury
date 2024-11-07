import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const locationSchema = new Schema({
    locationId: {
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

locationSchema.plugin(AutoIncrement, { inc_field: 'locationId', start_seq: 1 });

const Location = mongoose.model('Location', locationSchema);

export default Location;