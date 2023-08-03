import mongoose from "mongoose";
const { Schema, model } = mongoose;

const advertisementSchema = new Schema({
    title: String,
    description: String,
    imageURL: String,
},
    {
        timestamps: true,
        versionKey: false,
        collection: 'advertisements',
    }
);

export default model('Advertisement', advertisementSchema);