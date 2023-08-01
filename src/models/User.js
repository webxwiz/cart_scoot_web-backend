import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    userName: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: String,
    resetPassword: {
        token: String,
        expire: Date,
        changed: Date,
    },
    avatarURL: String,
    license: {
        text: String,
        licenseURL: String,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'DRIVER', 'PASSENGER'],
        default: 'PASSENGER',
    },

}, {
    timestamps: true,
    versionKey: false,
    collection: 'users',
}
);

export default model('User', userSchema);