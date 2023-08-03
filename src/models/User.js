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
        enum: ['ADMIN', 'SUBADMIN', 'DRIVER', 'RIDER', 'BANNED'],
        default: 'RIDER',
    },
    driverRequests: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Request',
        }
    ],
    workingDays: [Number],
    workingTime: {
        from: Number,
        to: Number,
    },
},
    {
        timestamps: true,
        versionKey: false,
        collection: 'users',
    }
);

export default model('User', userSchema);