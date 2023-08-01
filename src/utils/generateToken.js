import jwt from 'jsonwebtoken';

import 'dotenv/config';

export const generateToken = (_id, role) => {
    return jwt.sign(
        { _id, role },
        process.env.TOKEN_SECRET_KEY,
        { expiresIn: "2d" }
    )
};