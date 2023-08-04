import { GraphQLError } from 'graphql';

import AdvertisementModel from '../models/Advertisement.js';
import RequestModel from '../models/Request.js';
import UserModel from '../models/User.js';

import { checkAuth, findUserById, banUserSender } from '../utils/_index.js';

class AdminService {

    async changeUserRole({ id, role }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN') {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: id },
                {
                    $set: { role }
                },
                { new: true },
            );
            if (!updatedUser) {
                throw new GraphQLError("Modified forbidden")
            } else return updatedUser
        } else if ((user.role === 'SUBADMIN') && (role !== 'ADMIN')) {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: id },
                {
                    $set: { role }
                },
                { new: true },
            );
            if (!updatedUser) {
                throw new GraphQLError("Modified forbidden")
            } else return updatedUser
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async sendBannedEmail(email) {
        let status;
        try {
            status = await banUserSender(email);
        } catch (err) {
            throw new GraphQLError(err.message || "Can't send email")
        }
        return status;
    }

    async answerDriverLicense({ id, answer }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        const status = answer ? 'APPROVED' : 'REJECTED';

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: id },
                {
                    $set: { 'license.status': status }
                },
                { new: true },
            );
            if (!updatedUser) {
                throw new GraphQLError("Modified forbidden")
            } else return updatedUser
        }
    }

    async changeBunStatus(id, banned, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN') {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: id },
                {
                    $set: { banned }
                },
                { new: true },
            );
            if (!updatedUser) {
                throw new GraphQLError("Modified forbidden")
            } else return updatedUser
        } else if (user.role === 'SUBADMIN') {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: id, role: { $not: { $or: ['ADMIN', 'SUBADMIN'] } } },
                {
                    $set: { banned }
                },
                { new: true },
            );
            if (!updatedUser) {
                throw new GraphQLError("Modified forbidden")
            } else return updatedUser
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getProfilesByRole(role, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const users = await UserModel.find({ role });
            if (!users.length) {
                throw new GraphQLError("Can't find any users")
            };

            return users;
        }
    }

    async getAllUsers(token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const users = await UserModel.find();
            if (!users.length) {
                throw new GraphQLError("Can't find any users")
            };

            return users;
        }
    }

    async getAllRequests(token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const requests = await RequestModel.find();
            if (!requests.length) {
                throw new GraphQLError("Can't find any users")
            };

            return requests;
        }
    }

    async getAllLicenses(token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const users = await UserModel.find({ 'license.status': { $or: ['WAITING', 'APPROVED', 'REJECTED'] } });
            if (!users.length) {
                throw new GraphQLError("Can't find any users")
            };

            return users;
        }
    }

}

export default new AdminService;