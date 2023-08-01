import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { GraphQLError } from 'graphql';

import UserModel from '../models/User.js';
import { userValidate } from '../validation/userValidation.js';
import { createPasswordHash, generateToken, checkAuth, mailSender } from '../utils/_index.js';

class UserService {

    async getUserByToken(token) {
        const { _id } = checkAuth(token);
        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };

        return user;
    }

    async getProfileById(_id, role) {
        const user = await UserModel.findOne({ _id, role });
        if (!user) {
            throw new GraphQLError("Can't find user")
        };

        return user;
    }

    async getProfilesByRole(role) {
        const users = await UserModel.find({ role });
        if (!users.length) {
            throw new GraphQLError("Can't find any users")
        };

        return users;
    }

    async register(data) {
        await userValidate(data);
        const { email, password } = data;
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            throw new GraphQLError(`User ${email} already exist`, { extensions: { code: 'BAD_USER_INPUT' } })
        }
        const passwordHash = await createPasswordHash(password);
        const user = await UserModel.create({
            ...data,
            passwordHash,            
        });

        if (!user) {
            throw new GraphQLError('Database Error', { extensions: { code: 'DATABASE_ERROR' } })
        }
        const token = generateToken(user._id, user.role);

        return { user, token };
    }

    async login(data) {
        await userValidate(data);
        const { email, password } = data;
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new GraphQLError("Can't find user", { extensions: { code: 'BAD_USER_INPUT' } })
        }
        const isValidPass = await bcrypt.compare(password, user.passwordHash)
        if (!isValidPass) {
            throw new GraphQLError('Incorrect login or password', { extensions: { code: 'BAD_USER_INPUT' } })
        }
        const token = generateToken(user._id, user.role);

        return { user, token }
    }

    async update(data, token) {
        const { _id } = checkAuth(token);
        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id },
            {
                $set: { ...data }
            },
            { new: true },
        );
        if (!updatedUser) {
            throw new GraphQLError("Modified forbidden")
        } else return updatedUser
    }

    async delete(id, token) {
        const { _id } = checkAuth(token);

        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };

        if (_id === id) {
            const userStatus = await UserModel.deleteOne({ _id });

            return userStatus;
        } else {
            throw new GraphQLError("Authorization error")
        }
    }

    async resetPassword(email) {
        await userValidate({ email });
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new GraphQLError("Can't find user", { extensions: { code: 'BAD_USER_INPUT' } })
        }

        const buffer = crypto.randomBytes(16);
        if (!buffer) throw new GraphQLError("Something get wrong")
        const token = buffer.toString('hex');

        let status;
        try {
            status = await mailSender(token, email);
        } catch (err) {
            throw new GraphQLError(err.message || "Can't send email")
        }

        const updatedUser = await UserModel.findOneAndUpdate(
            { email },
            {
                'resetPassword.token': token,
                'resetPassword.expire': Date.now() + (3600 * 1000),
            },
            { new: true },
        );
        if (!updatedUser) {
            throw new GraphQLError("Can't reset password")
        } else return status;
    }

    async setNewPassword({ token, password }) {
        await userValidate({ password });

        const passwordHash = await createPasswordHash(password);
        const updatedUser = await UserModel.findOneAndUpdate(
            { 'resetPassword.token': token, 'resetPassword.expire': { $gt: Date.now() } },
            {
                $set: {
                    passwordHash,
                    'resetPassword.token': null,
                    'resetPassword.expire': null,
                    'resetPassword.changed': Date.now(),
                }
            },
            { new: true },
        );
        if (!updatedUser) {
            throw new GraphQLError("Can't set new password")
        } else return updatedUser;
    }

    async confirmPassword(password, token) {
        await userValidate({ password });

        const { _id } = checkAuth(token);
        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };
        const isValidPass = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPass) {
            throw new GraphQLError("Wrong password!")
        } else return {
            status: true,
            message: 'Password confirmed'
        }
    }

    async updatePassword(password, token) {
        await userValidate({ password });

        const { _id } = checkAuth(token);
        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };

        const isValidPass = await bcrypt.compare(password, user.passwordHash);
        if (isValidPass) {
            throw new GraphQLError("The same password!", { extensions: { code: 'BAD_USER_INPUT' } })
        }
        const passwordHash = await createPasswordHash(password);
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id },
            { passwordHash },
            { new: true },
        );
        if (!updatedUser) {
            throw new GraphQLError("Can't change password")
        }
        return updatedUser;
    }
}

export default new UserService;