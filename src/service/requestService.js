import crypto from 'crypto';
import { Types } from 'mongoose';

import { GraphQLError } from 'graphql';

import RequestModel from '../models/Request.js';
import UserModel from '../models/User.js';
import ReviewModel from '../models/Review.js';

import {
    checkAuth,
    findUserById,
    findUserByIdAndRole,
    mailSender,
    smsSender,
    statusTypes,
    userTypes,
    licenseTypes,
} from '../utils/_index.js';

class RequestService {
    get userPopulatedFields() {
        return ['_id', 'userName', 'avatarURL', 'phone'];
    }
    get requestCode() {
        const firstPart = crypto.randomBytes(2).toString('hex');
        const secondPart = crypto.randomBytes(1).toString('hex');
        const thirdPart = new Date().getFullYear().toString();
        return `${firstPart}-${secondPart}${thirdPart.slice(2)}`;
    }

    async getRequest(id, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const request = await RequestModel.findById(id)
            .populate({ path: 'driverId', select: this.userPopulatedFields })
            .populate({ path: 'userId', select: this.userPopulatedFields });
        if (!request) {
            throw new GraphQLError("Can't find request");
        }

        const driverReviews = await ReviewModel.aggregate()
            .match({ driverId: request.driverId?._id })
            .group({
                _id: '$driverId',
                totalCount: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            });
        let avgRating;
        driverReviews?.length === 0
            ? (avgRating = 0)
            : (avgRating = Math.round(driverReviews[0]?.avgRating * 10) / 10);

        return { request, avgRating };
    }

    async getRequestsByRider({ status, page, searchRequestCode, dateFrom, dateTo }, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const validPage = page ? (page > 0 ? page : 1) : 1;
        const filters = {
            userId: _id,
            createdAt: {
                $gte: dateFrom || new Date('2020-12-17T03:24:00').toJSON(),
                $lte: dateTo || Date.now(),
            },
            ...(status && { status }),
            ...(searchRequestCode && {
                requestCode: { $regex: searchRequestCode, $options: 'i' },
            }),
        };

        const requests = await RequestModel.find(filters)
            .limit(6 * validPage)
            .sort({ createdAt: -1 })
            .populate({ path: 'driverId', select: this.userPopulatedFields });

        const totalCount = (await RequestModel.find(filters)).length;

        return { requests, totalCount };
    }

    async getRequestsByDriver({ status, page, searchRequestCode, dateFrom, dateTo }, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const validPage = page ? (page > 0 ? page : 1) : 1;
        const filters = {
            driverId: _id,
            createdAt: {
                $gte: dateFrom || new Date('2020-12-17T03:24:00').toJSON(),
                $lte: dateTo || Date.now(),
            },
            ...(status && { status }),
            ...(searchRequestCode && {
                requestCode: { $regex: searchRequestCode, $options: 'i' },
            }),
        };

        const requests = await RequestModel.find(filters)
            .limit(6 * validPage)
            .sort({ createdAt: -1 })
            .populate({ path: 'userId', select: this.userPopulatedFields });

        const totalCount = (await RequestModel.find(filters)).length;

        return { requests, totalCount };
    }

    async createOneDriverRequest({ id, ...data }, role, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, role);
        const {
            email,
            phone: { number, confirmed },
        } = await findUserById(id);

        const request = await RequestModel.create({
            userId: _id,
            driverId: id,
            status: statusTypes.pending,
            requestCode: this.requestCode,
            ...data,
        });

        if (!request) {
            throw new GraphQLError('Database Error', {
                extensions: { code: 'DATABASE_ERROR' },
            });
        }

        if (number && confirmed) {
            await smsSender(`Your have new request ${request.requestCode}`, number);
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Car Rent Request',
                text: 'New car rent request!',
                html: `
                    <h2>Hello!</h2>
                    <h2>You have new car rent request ${request.requestCode}!</h2>
                    <h4>Please, follow the link for more details</h4>
                    <hr/>
                    <br/>
                    <a href='${process.env.FRONT_URL}/requestsList'>Link for details</a>
                `,
            });
        }

        return request;
    }

    async createDriversRequest(data, role, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, role);

        const { requestedTime } = data;
        const dayOfWeek = new Date(requestedTime).getDay();
        const time = +`${new Date(requestedTime).getHours()}.${new Date(
            requestedTime
        ).getMinutes()}`;

        const driverArray = await UserModel.find(
            {
                workingDays: { $in: dayOfWeek },
                'workingTime.from': { $lte: time },
                'workingTime.to': { $gt: time },
                role: 'DRIVER',
                'license.status': licenseTypes.approved,
                banned: { $ne: true },
            },
            { email: 1, phone: 1 }
        );
        const driverEmails = driverArray
            .map((user) => user?.email)
            .filter((email) => email !== undefined || null);
        const driverPhones = driverArray
            .map((user) => user?.phone)
            .filter((phone) => (phone?.number !== undefined || null) && phone?.confirmed === true);

        const request = await RequestModel.create({
            userId: _id,
            status: statusTypes.pending,
            requestCode: this.requestCode,
            ...data,
        });

        let smsStatuses = [];
        if (driverPhones.length) {
            for (const phone of driverPhones) {
                const status = await smsSender(
                    `Your have common request ${request.requestCode}`,
                    phone?.number
                );
                smsStatuses.push(status);
            }
        }

        let emailStatuses = [];
        if (driverEmails.length) {
            for (const email of driverEmails) {
                const status = await mailSender({
                    to: email,
                    subject: 'Car Rent Request',
                    text: 'New car rent request!',
                    html: `
                        <h2>Hello!</h2>
                        <h2>Your have common request ${request.requestCode}!</h2>
                        <h4>Please, follow the link for more details</h4>
                        <hr/>
                        <br/>
                        <a href='${process.env.FRONT_URL}/requestsList'>Link for details</a>
                    `,
                });
                emailStatuses.push(status[0].statusCode);
            }
        }
        const successEmailsCount = emailStatuses.map((item) => item === 202);
        const totalDrivers = smsStatuses.length + successEmailsCount.length;

        return {
            request,
            message: `Your request successfully sent to ${totalDrivers} drivers`,
        };
    }

    async driverOneCallAnswer({ requestId, answer }, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, userTypes.driver);

        const status = answer ? statusTypes.active : statusTypes.cancelled;

        const request = await RequestModel.findOneAndUpdate(
            { _id: requestId },
            {
                $set: { status },
            },
            { new: true }
        );
        if (!request) {
            throw new GraphQLError('Modified forbidden');
        }

        const {
            email,
            phone: { number, confirmed },
        } = await findUserById(request.userId);
        if (number && confirmed) {
            await smsSender(
                `Your request ${request.requestCode} has been ${answer ? 'approved' : 'cancelled'}`,
                number
            );
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Request answer',
                text: `Your request ${request.requestCode} has been ${
                    answer ? 'approved' : 'cancelled'
                }`,
                html: `
                    <h2>Your request ${request.requestCode} has been ${
                    answer ? 'approved' : 'cancelled'
                }</h2>                        
                `,
            });
        }

        return request;
    }

    async driverMultiCallAnswer({ requestId, answer }, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, userTypes.driver);

        const status = answer ? statusTypes.approved : statusTypes.cancelled;

        const request = await RequestModel.findOneAndUpdate(
            { _id: requestId },
            {
                $set: { status, driverId: _id },
            },
            { new: true }
        );
        if (!request) throw new GraphQLError('Modified forbidden');

        const {
            email,
            phone: { number, confirmed },
        } = await findUserById(request.userId);

        if (number && confirmed) {
            await smsSender(
                `Your request ${request.requestCode} has been ${answer ? 'approved' : 'cancelled'}`,
                number
            );
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Request status',
                text: `Your request ${request.requestCode} has been ${
                    answer ? 'approved' : 'cancelled'
                }`,
                html: `
                        <h2>Your request ${request.requestCode} has been ${
                    answer ? 'approved' : 'cancelled'
                }</h2>                        
                    `,
            });
        }
        return request;
    }

    async riderMultiCallAnswer({ requestId, answer }, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, userTypes.rider);

        let request;
        if (answer) {
            request = await RequestModel.findOneAndUpdate(
                { _id: requestId },
                {
                    $set: { status: statusTypes.active },
                },
                { new: true }
            );
        } else {
            request = await RequestModel.findOneAndUpdate(
                { _id: requestId },
                {
                    $set: { status: statusTypes.pending, driverId: null },
                },
                { new: false }
            );
        }
        if (!request) throw new GraphQLError('Modified forbidden');

        const {
            email,
            phone: { number, confirmed },
        } = await findUserById(request.driverId);

        if (number && confirmed) {
            await smsSender(
                `The request ${request.requestCode} has been ${answer ? 'approved' : 'cancelled'}`,
                number
            );
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Request status',
                text: `The request ${request.requestCode} has been ${
                    answer ? 'approved' : 'cancelled'
                }`,
                html: `
                        <h2>The request ${request.requestCode} has been ${
                    answer ? 'approved' : 'cancelled'
                }</h2>                        
                    `,
            });
        }
        return request;
    }

    async changeRequestStatus(requestId, status, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const request = await RequestModel.findOneAndUpdate(
            { _id: requestId },
            {
                $set: { status },
            },
            { new: true }
        );
        if (!request) {
            throw new GraphQLError('Modified forbidden');
        }

        if (request?.driverId) {
            const {
                email,
                phone: { number, confirmed },
            } = await findUserById(request.driverId);

            if (number && confirmed) {
                await smsSender(`The request ${request.requestCode} has status ${status}`, number);
            } else if (email) {
                await mailSender({
                    to: email,
                    subject: 'Request status',
                    text: `The request ${request.requestCode} has status ${status}`,
                    html: `
                        <h2>The request ${request.requestCode} has status ${status}</h2>                        
                    `,
                });
            }
        }

        return request;
    }

    async finishedRequestByDriver(id, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const request = await RequestModel.findOneAndUpdate(
            { _id: id },
            {
                $set: { status: statusTypes.finished },
            },
            { new: true }
        );
        if (!request) {
            throw new GraphQLError('Modified forbidden');
        } else return request;
    }

    async getPendingRequestsByDriver(status, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const requests = await RequestModel.find({
            status,
            driverId: { $in: [_id, null] },
        }).populate({ path: 'userId', select: this.userPopulatedFields });

        return requests;
    }

    async getActiveRequestsAmount(userId) {
        if (userId) {
            const requestsAmount = await RequestModel.aggregate()
                .match({
                    userId: new Types.ObjectId(userId),
                    status: { $in: [statusTypes.active, statusTypes.approved] },
                })
                .group({
                    _id: '$userId',
                    totalCount: { $sum: 1 },
                });

            return { requestAmount: requestsAmount[0]?.totalCount };
        } else return { requestAmount: null };
    }

    async changeStatusOfOutdatedRequests() {
        const userPopulatedFields = ['userName', 'email', 'phone'];

        const activeOutdatedFilters = {
            status: { $in: [statusTypes.active] },
            requestedTime: { $lt: Date.now() - 3600 * 1000 * 24 },
        };
        const pendingOutdatedFilters = {
            status: { $in: [statusTypes.pending] },
            requestedTime: { $lt: Date.now() },
        };
        const approvedOutdatedFilters = {
            status: { $in: [statusTypes.approved] },
            updatedAt: { $lt: Date.now() - 3600 * 1000 * 24 },
        };

        const activeOutdatedRequests = await RequestModel.find(activeOutdatedFilters).populate({
            path: 'userId',
            select: userPopulatedFields,
        });

        for (const request of activeOutdatedRequests) {
            if (request.userId?.phone?.number && request.userId?.phone?.confirmed) {
                await smsSender(
                    `The request ${request.requestCode} change status to Finished because request time is expired`,
                    request.userId.phone.number
                );
            } else if (request.userId?.email) {
                await mailSender({
                    to: request.userId.email,
                    subject: 'Request status',
                    text: `The request ${request.requestCode} change status to Finished because request time is expired`,
                    html: `
                        <h2>The request ${request.requestCode} change status to Finished because request time is expired</h2>                        
                    `,
                });
            }
        }
        await RequestModel.updateMany(activeOutdatedFilters, {
            $set: { status: statusTypes.finished },
        });

        const pendingOutdatedRequests = await RequestModel.find(pendingOutdatedFilters).populate({
            path: 'userId',
            select: userPopulatedFields,
        });

        for (const request of pendingOutdatedRequests) {
            if (request.userId?.phone?.number) {
                await smsSender(
                    `The request ${request.requestCode} change status to Cancelled because request time is expired`,
                    request.userId.phone.number
                );
            } else if (request.userId?.email) {
                await mailSender({
                    to: request.userId.email,
                    subject: 'Request status',
                    text: `The request ${request.requestCode} change status to Cancelled because request time is expired`,
                    html: `
                        <h2>The request ${request.requestCode} change status to Cancelled because request time is expired</h2>                        
                    `,
                });
            }
        }
        await RequestModel.updateMany(pendingOutdatedFilters, {
            $set: { status: statusTypes.cancelled },
        });

        const approvedOutdatedRequests = await RequestModel.find(approvedOutdatedFilters).populate({
            path: 'userId',
            select: userPopulatedFields,
        });

        for (const request of approvedOutdatedRequests) {
            if (request.userId?.phone?.number) {
                await smsSender(
                    `The request ${request.requestCode} change status to Pending because request has not been approved by rider`,
                    request.userId.phone.number
                );
            } else if (request.userId?.email) {
                await mailSender({
                    to: request.userId.email,
                    subject: 'Request status',
                    text: `The request ${request.requestCode} change status to Pending because request has not been approved by rider`,
                    html: `
                        <h2>The request ${request.requestCode} change status to Pending because request has not been approved by rider</h2>                        
                    `,
                });
            }
        }
        await RequestModel.updateMany(approvedOutdatedFilters, {
            $set: { status: statusTypes.pending, driverId: null },
        });
    }
}

export default new RequestService();
