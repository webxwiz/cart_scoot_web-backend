import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
    createdBy: String,
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: String,
    rating: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5],
        default: 0
    }
},
    {
        timestamps: true,
        versionKey: false,
        collection: 'reviews',
    }
);

export default model('Review', reviewSchema);