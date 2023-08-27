import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { GraphQLError } from 'graphql';

import UserModel from '../models/User.js';

import { userValidate } from '../validation/userValidation.js';
import { createPasswordHash, generateToken, checkAuth, findUserById, mailSender, smsSender } from '../utils/_index.js';

class UserService {

    async getUserByToken(token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        return user;
    }

    async getProfileById(_id, role) {
        const user = await UserModel.findOne({ _id, role });
        if (!user) {
            throw new GraphQLError("Can't find user")
        };

        return user;
    }

    async registerByPhone(phone) {
        const smsCode = crypto.randomInt(100000, 999999);
        const smsSendResult = await smsSender(`Your secret code is ${smsCode}`, phone);
        if (!smsSendResult.sid) {
            throw new GraphQLError("Can't send SMS. Check your number")
        };
        const phoneCode = {
            code: smsCode,
            expire: Date.now() + (3600 * 1000),
            updated: Date.now(),
        }
        const candidate = await UserModel.findOne({ phone });
        if (candidate) {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: candidate._id },
                {
                    $set: { phoneCode }
                },
                { new: true },
            );
            if (!updatedUser) {
                throw new GraphQLError("Modified forbidden")
            } else return updatedUser;
        } else {
            const user = await UserModel.create({
                phone,
                phoneCode,
            });

            if (!user) {
                throw new GraphQLError('Database Error', { extensions: { code: 'DATABASE_ERROR' } })
            } else return user;
        }
    }

    async loginByPhone({ phone, smsCode }) {
        const user = await UserModel.findOne(
            {
                phone,
                'phoneCode.code': smsCode,
                'phoneCode.expire': { $gt: Date.now() },
                role: 'RIDER',
            },
        );
        if (!user) {
            throw new GraphQLError("Can't login user. Try again")
        } else {
            const token = generateToken(user._id, user.role);

            return { user, token }
        }
    }

    async registerByEmail(data) {
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

    async loginByEmail(data) {
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
        await findUserById(_id);

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
        await findUserById(_id);

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
            status = await mailSender({
                to: email,
                subject: 'Restore password',
                text: 'Please, follow the link to set new password',
                html: `
                    <h2>Please, follow the link to set new password</h2>
                    <h4>If you don't restore your password ignore this mail</h4>
                    <hr/>
                    <br/>
                    <a href='${process.env.FRONT_URL}/auth/reset/${token}'>Link for set new password</a>
                `,
            });
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

    async changePassword({ currentPassword, password }, token) {
        await userValidate({ password });

        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        const isValidPass = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValidPass) {
            throw new GraphQLError("Wrong password!")
        } else {
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

    async getFreeDrivers(requestedTime) {

        const dayOfWeek = new Date(requestedTime).getDay();
        const hour = new Date(requestedTime).getHours();

        const drivers = await UserModel.find({
            workingDays: { $in: dayOfWeek },
            'workingTime.from': { $lte: hour },
            'workingTime.to': { $gt: hour },
        });

        return drivers;
    }

}

export default new UserService;