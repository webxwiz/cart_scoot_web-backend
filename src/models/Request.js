import mongoose from "mongoose";
const { Schema, model } = mongoose;

const requestSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    isReviewed: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['PENDING', 'CANCELLED', 'APPROVED', 'ACTIVE', 'FINISHED'],
        default: 'PENDING',
    },
    carType: {
        type: Number,
        enum: [4, 6],
        default: 4
    },
    coordinates: {
        start: {
            lat: Number,
            lon: Number,
        },
        end: {
            lat: Number,
            lon: Number,
        },
    },
    requestCode: String,
    pickupLocation: String,
    dropoffLocation: String,
    requestedTime: Date
},
    {
        timestamps: true,
        versionKey: false,
        collection: 'requests',
    }
);

export default model('Request', requestSchema);