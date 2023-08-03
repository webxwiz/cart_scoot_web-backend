import mongoose from "mongoose";
const { Schema, model } = mongoose;

const requestSchema = new Schema({
    createdBy: {
        type: String,
        required: true,
    },
    description: String,
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['PENDING', 'REJECTED', 'APPROVED', 'ACTIVE', 'FINISHED'],
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
    requestedTime: Date
},
    {
        timestamps: true,
        versionKey: false,
        collection: 'requests',
    }
);

export default model('Request', requestSchema);