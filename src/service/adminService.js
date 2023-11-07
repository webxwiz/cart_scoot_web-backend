import { Types } from 'mongoose';
import { GraphQLError } from 'graphql';

import AdvertisementModel from '../models/Advertisement.js';
import RequestModel from '../models/Request.js';
import UserModel from '../models/User.js';
import ReviewModel from '../models/Review.js';

import { checkAuth, findAdminByToken, findUserById, mailSender, smsSender } from '../utils/_index.js';

class AdminService {

    get userPopulatedFields() {
        return ['_id', 'userName', 'avatarURL', 'phone'];
    }

    async getDriverWithRating(driverId, token) {

        await findAdminByToken(token);

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
    }

    async getStatistic(token) {

        await findAdminByToken(token);

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
    }

    async getAllAdvertisements(pageNumber, token) {
        await findAdminByToken(token);

        const validatePageNumber = pageNumber > 0 ? pageNumber : 1;
        const itemsOnPage = 7;

        const advertisements = await AdvertisementModel
            .aggregate()
            .facet({
                data: [
                    { $sort: { createdAt: -1 } },
                    { $limit: itemsOnPage * validatePageNumber }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            })
        if (!advertisements) {
            throw new GraphQLError("Can't find any advertisements")
        };

        return { advertisements: advertisements[0]?.data, totalCount: advertisements[0]?.totalCount[0]?.count };
    }

    async getAdvertisementById(adsId, token) {
        await findAdminByToken(token);

        const advertisement = await AdvertisementModel.findById(adsId);
        if (!advertisement) {
            throw new GraphQLError("Can't find advertisement")
        };

        return advertisement;
    }

    async addAdvertisement(data, token) {

        await findAdminByToken(token);

        const advertisement = await AdvertisementModel.create({
            ...data,
        });
        if (!advertisement) {
            throw new GraphQLError('Database Error', { extensions: { code: 'DATABASE_ERROR' } })
        }

        return advertisement;
    }

    async deleteAdvertisement(id, token) {

        await findAdminByToken(token);

        const advertisementStatus = await AdvertisementModel.deleteOne({ _id: id });

        return advertisementStatus;

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

        await findAdminByToken(token);

        const status = answer ? 'APPROVED' : 'REJECTED';

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
    }

    async sendBannedInfo(_id, banned) {
        const user = await UserModel.findById(_id);
        if (!user) {
            throw new GraphQLError("Can't find user")
        };

        if (user.phone?.number) {
            return await smsSender(banned ?
                `Your account has been banned by administrator`
                : `Your account is active`,
                user.phone.number);
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

        await findAdminByToken(token);

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
    }

    async getAllRequests({ pageNumber, itemsOnPage, searchRequestCode, dateFrom, dateTo, status }, token) {

        await findAdminByToken(token);

        const validatePageNumber = pageNumber > 0 ? pageNumber : 1;
        const validItemsOnPage = itemsOnPage > 0 ? itemsOnPage : 7;

        const filters = {
            createdAt: { $gte: new Date(dateFrom || '2020-12-17T03:24:00'), $lte: new Date(dateTo || Date.now()) },
            ...(status && { status }),
            ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
        }

        const requests = await RequestModel.find(filters)
            .sort({ createdAt: -1 })
            .limit(validItemsOnPage * validatePageNumber)
            .populate({ path: 'userId', select: this.userPopulatedFields })
            .populate({ path: 'driverId', select: this.userPopulatedFields });

        const totalCount = (await RequestModel.find(filters)).length;

        return { requests, totalCount };
    }

    async getWaitingLicenses(token) {

        await findAdminByToken(token);

        const users = await UserModel.find({
            'license.status': 'WAITING',
        }).sort({ createdAt: -1 });

        return users;
    }

    async getAllReviews({ pageNumber, searchRequestCode, dateFrom, dateTo }, token) {

        await findAdminByToken(token);

        const validatePageNumber = pageNumber > 0 ? pageNumber : 1;
        const itemsOnPage = 7;

        const filters = {
            createdAt: { $gte: new Date(dateFrom || '2020-12-17T03:24:00'), $lte: new Date(dateTo || Date.now()) },
            ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
        }

        const reviews = await ReviewModel.find(filters)
            .sort({ createdAt: -1 })
            .limit(itemsOnPage * validatePageNumber)
            .populate({ path: 'createdBy', select: this.userPopulatedFields });

        const totalCount = (await ReviewModel.find(filters)).length;

        return { reviews, totalCount }
    }

    async getReviewByRequestCode(requestCode, token) {

        await findAdminByToken(token);

        const review = await ReviewModel.findOne({ requestCode })
            .populate({ path: 'createdBy', select: this.userPopulatedFields })
            .populate({ path: 'driverId', select: this.userPopulatedFields });

        return review;
    }
}

export default new AdminService;