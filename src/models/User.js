import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    userName: String,
    email: String,
    passwordHash: String,
    resetPassword: {
        token: String,
        expire: Date,
        changed: Date,
    },
    avatarURL: String,
    license: {
        url: [String],
        message: String,
        status: {
            type: String,
            enum: ['PENDING', 'WAITING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
        },
    },
    role: {
        type: String,
        enum: ['ADMIN', 'SUBADMIN', 'DRIVER', 'RIDER'],
        default: 'RIDER',
    },
    banned: {
        type: Boolean,
        default: false,
    },
    driverRequests: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Request',
        }
    ],
    workingDays: [Number],
    workingTime: {
        from: Date,
        to: Date,
    },
    phoneCode: {
        code: String,
        expire: Date,
    },
    phone: {
        number: String,
        confirmed: {
            type: Boolean,
            default: false,
        },
    },
    coordinates: {
        lat: Number,
        lon: Number,
    },
},
    {
        timestamps: true,
        versionKey: false,
        collection: 'users',
    }
);

export default model('User', userSchema);