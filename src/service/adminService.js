import { Types } from 'mongoose';
import { GraphQLError } from 'graphql';

import AdvertisementModel from '../models/Advertisement.js';
import RequestModel from '../models/Request.js';
import UserModel from '../models/User.js';
import ReviewModel from '../models/Review.js';

import { checkAuth, findUserById, mailSender, smsSender } from '../utils/_index.js';

class AdminService {

    async getDriverWithRating(driverId, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const driver = await UserModel.findOne({ _id: driverId });
            if (!driver) {
                throw new GraphQLError("Can't find user")
            };

            const driverRating = await ReviewModel
                .aggregate()
                .match({ driverId: new Types.ObjectId(driverId) })
                .group({
                    _id: '$driverId',
                    totalCount: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                });
            const rating = Math.round(driverRating[0]?.avgRating * 10) / 10 || 0;
            const totalCount = driverRating[0]?.totalCount;

            return { driver, rating, totalCount };
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getStatistic(token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const users = await UserModel
                .aggregate()
                .group({
                    _id: '$role',
                    count: {
                        $sum: 1,
                    },
                });

            const totalRiders = users?.find(item => item._id === 'RIDER')?.count || 0;
            const totalDrivers = users?.find(item => item._id === 'DRIVER')?.count || 0;

            const totalTrips = await RequestModel.countDocuments();

            return { totalRiders, totalDrivers, totalTrips }
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getAllAdvertisement() {
        const advertisements = await AdvertisementModel.find().sort({ createdAt: -1 });
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

    async answerDriverLicense({ driverId, answer }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        const status = answer ? 'APPROVED' : 'REJECTED';

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const updatedUser = await UserModel.findOneAndUpdate(
                { _id: driverId },
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

    async sendBannedInfo(_id, banned) {
        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };

        if (user.phone.number) {
            return await smsSender(banned ?
                `Your account with email - ${user.email} has been banned by administrator`
                : `Your account with email - ${user.email} is active`,
                phoneNumber);
        } else {
            await mailSender({
                to: user.email,
                subject: 'User status information',
                text: banned ? 'Your account banned' : 'Your account is activate',
                html: banned ?
                    `
                        <h2>Hello!</h2>
                        <h2>You account has been banned by administrator. Please contact for details</h2>
                        <h4>Please, follow the link for more details</h4>
                        <hr/>
                        <br/>
                        <a href='${process.env.FRONT_URL}/contacts'>Contact link</a>
                    ` :
                    `
                        <h2>Hello!</h2>
                        <h2>You account has been activated. You can use our service</h2>
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
                this.sendBannedInfo(id, banned);
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
                this.sendBannedInfo(id, banned);
                return updatedUser
            }
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getProfilesByRole(role, { pageNumber, searchUserName, status }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const validatePageNumber = pageNumber > 0 ? pageNumber : 1;
            const itemsOnPage = 7;

            const users = await UserModel
                .aggregate()
                .match({
                    role,
                    ...(status && { "license.status": status }),
                    ...(searchUserName && { userName: { $regex: searchUserName, $options: 'i' } }),
                })
                .facet({
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $limit: itemsOnPage * validatePageNumber }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                })
            if (!users) {
                throw new GraphQLError("Can't find any users")
            };

            return { users: users[0]?.data, totalCount: users[0]?.totalCount[0]?.count };
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getAllRequests({ pageNumber, itemsOnPage, searchRequestCode, dateFrom, dateTo, status }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const validatePageNumber = pageNumber > 0 ? pageNumber : 1;
            const validItemsOnPage = itemsOnPage > 0 ? itemsOnPage : 7;

            const userPopulatedFields = ['_id', 'userName', 'avatarURL', 'phone'];

            const requests = await RequestModel
                .find({
                    createdAt: { $gte: new Date(dateFrom || '2020-12-17T03:24:00'), $lte: new Date(dateTo || Date.now()) },
                    ...(status && { status }),
                    ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
                })
                .sort({ createdAt: -1 })
                .limit(validItemsOnPage * validatePageNumber)
                .populate({ path: 'userId', select: userPopulatedFields })
                .populate({ path: 'driverId', select: userPopulatedFields });

            const totalCount = (await RequestModel
                .find({
                    createdAt: { $gte: new Date(dateFrom || '2020-12-17T03:24:00'), $lte: new Date(dateTo || Date.now()) },
                    ...(status && { status }),
                    ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
                })).length;

            return { requests, totalCount };
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getWaitingLicenses(token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const users = await UserModel.find({
                'license.status': 'WAITING',
            }).sort({ createdAt: -1 });

            return users;
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }

    async getAllReviews({ pageNumber, searchRequestCode, dateFrom, dateTo }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            const validatePageNumber = pageNumber > 0 ? pageNumber : 1;
            const itemsOnPage = 7;

            const reviews = await ReviewModel
                .aggregate()
                .match({
                    createdAt: { $gte: new Date(dateFrom || '2020-12-17T03:24:00'), $lte: new Date(dateTo || Date.now()) },
                    ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
                })
                .facet({
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $limit: itemsOnPage * validatePageNumber }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                })

            return { reviews: reviews[0]?.data, totalCount: reviews[0]?.totalCount[0]?.count };
        } else {
            throw new GraphQLError("You haven't appropriate access")
        }
    }
}

export default new AdminService;