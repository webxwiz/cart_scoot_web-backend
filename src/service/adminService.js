import { GraphQLError } from 'graphql';

import AdvertisementModel from '../models/Advertisement.js';
import RequestModel from '../models/Request.js';
import UserModel from '../models/User.js';

import { checkAuth, findUserById, mailSender, smsSender } from '../utils/_index.js';

class AdminService {

    async getAllAdvertisement() {
        const advertisements = await AdvertisementModel.find();
        if (advertisements) {
            throw new GraphQLError("Can't find any advertisements")
        };

        return advertisements;
    }

    async addAdvertisement(data, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const advertisement = await AdvertisementModel.create({
                ...data,
            });
            if (!advertisement) {
                throw new GraphQLError('Database Error', { extensions: { code: 'DATABASE_ERROR' } })
            }

            return advertisement;
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async deleteAdvertisement(id, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const advertisementStatus = await AdvertisementModel.deleteOne({ _id: id });

            return advertisementStatus;
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

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
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async sendBannedInfo(_id) {
        const user = await findUserById(_id);        
        if (user.phone.number) {
            return await smsSender(`Your account with email - ${user.email} has been banned by administrator`, phoneNumber);
        } else {
            await mailSender({
                to: user.email,
                subject: 'Banned information',
                text: 'Your account banned',
                html: `
                        <h2>Hello!</h2>
                        <h2>You account has been banned by administrator. Please contact for details</h2>
                        <h4>Please, follow the link for more details</h4>
                        <hr/>
                        <br/>
                        <a href='${process.env.FRONT_URL}/contacts'>Contact link</a>
                    `,
            });
            return true;
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
            } else {
                if (banned) this.sendBannedInfo(id);
                return updatedUser
            }
        } else if (user.role === 'SUBADMIN') {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: id, $or: [{ role: 'RIDER' }, { role: 'DRIVER' }] },
                {
                    $set: { banned }
                },
                { new: true },
            );
            if (!updatedUser) {
                throw new GraphQLError("Modified forbidden")
            } else {
                if (banned) this.sendBannedInfo(id);
                return updatedUser
            }
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
        } else {
            throw new GraphQLError("You haven't appropriate access")
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
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getAllRequests(token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const requests = await RequestModel.find();
            if (!requests.length) {
                throw new GraphQLError("Can't find any requests")
            };

            return requests;
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getAllLicenses(token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const users = await UserModel.find({
                $or: [
                    { 'license.status': 'WAITING' },
                    { 'license.status': 'APPROVED' },
                    { 'license.status': 'REJECTED' }
                ]
            });
            if (!users.length) {
                throw new GraphQLError("Can't find any users")
            };

            return users;
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

}

export default new AdminService;