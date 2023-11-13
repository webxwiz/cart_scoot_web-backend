import mongoose from "mongoose";
const { Schema, model } = mongoose;

const advertisementSchema = new Schema({
    title: String,
    description: String,
    imageURL: {
        desktop: String,
        tablet: String,
        mobile: String,
    },
    link: String,
    from: Date,
    to: Date,
    position: {
        type: String,
        enum: ['MAIN', 'MAP', 'TRIP'],
        default: 'MAIN',
    },
},
    {
        timestamps: true,
        versionKey: false,
        collection: 'advertisements',
    }
);

export default model('Advertisement', advertisementSchema);