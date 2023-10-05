import crypto from 'crypto';

import { GraphQLError } from 'graphql';

import RequestModel from '../models/Request.js';
import UserModel from '../models/User.js';
import ReviewModel from '../models/Review.js';

import { checkAuth, findUserById, findUserByIdAndRole, mailSender, smsSender } from '../utils/_index.js';


class RequestService {

    async getRequest(id, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const userPopulatedFields = ['_id', 'userName', 'avatarURL', 'phone'];
        const request = await RequestModel.findById(id)
            .populate({ path: 'driverId', select: userPopulatedFields })
            .populate({ path: 'userId', select: userPopulatedFields });
        if (!request) {
            throw new GraphQLError("Can't find request")
        };

        const driverReviews = await ReviewModel
            .aggregate()
            .match({ driverId: request.driverId?._id })
            .group({
                _id: '$driverId',
                totalCount: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            });
        let avgRating;
        driverReviews?.length === 0
            ? avgRating = 0
            : avgRating = Math.round(driverReviews[0]?.avgRating * 10) / 10;

        return { request, avgRating };
    }

    async getRequestsByRider(
        { status, page, searchRequestCode, dateFrom, dateTo }, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const validPage = page ? page > 0 ? page : 1 : 1;
        const userPopulatedFields = ['_id', 'userName', 'avatarURL'];
        const requests = await RequestModel.find
            ({
                userId: _id,
                createdAt: { $gte: dateFrom || new Date('2020-12-17T03:24:00').toJSON(), $lte: dateTo || Date.now() },
                ...(status && { status }),
                ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
            })
            .limit(6 * validPage)
            .sort({ createdAt: -1 })
            .populate({ path: 'driverId', select: userPopulatedFields });

        return requests;
    }

    async getRequestsByDriver(
        { status, page, searchRequestCode, dateFrom, dateTo }, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const validPage = page ? page > 0 ? page : 1 : 1;
        const userPopulatedFields = ['_id', 'userName', 'avatarURL'];
        const requests = await RequestModel.find
            ({
                driverId: _id,
                createdAt: { $gte: dateFrom || new Date('2020-12-17T03:24:00').toJSON(), $lte: dateTo || Date.now() },
                ...(status && { status }),
                ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
            })
            .limit(6 * validPage)
            .sort({ createdAt: -1 })
            .populate({ path: 'userId', select: userPopulatedFields });

        return requests;
    }

    async createOneDriverRequest({ id, ...data }, role, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, role);
        const { email, phone: { number, confirmed } } = await findUserById(id);

        const firstPart = crypto.randomBytes(2).toString('hex');
        const secondPart = crypto.randomBytes(1).toString('hex');
        const thirdPart = new Date().getFullYear().toString();
        const requestCode = `${firstPart}-${secondPart}${thirdPart.slice(2)}`;

        const request = await RequestModel.create({
            userId: _id,
            driverId: id,
            status: 'PENDING',
            requestCode,
            ...data
        });

        if (!request) {
            throw new GraphQLError('Database Error', { extensions: { code: 'DATABASE_ERROR' } })
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
        const time = +`${requestedTime.getHours()}.${requestedTime.getMinutes()}`

        const driverArray = await UserModel.find({
            workingDays: { $in: dayOfWeek },
            'workingTime.from': { $lte: time },
            'workingTime.to': { $gt: time },
        });
        const driverEmails = driverArray.map(user => user.email).filter(phone => phone !== undefined || null);
        const driverPhones = driverArray.map(user => user.phone?.number).filter(phone => phone !== undefined || null);

        const firstPart = crypto.randomBytes(3).toString('hex');
        const secondPart = crypto.randomBytes(2).toString('hex');
        const thirdPart = new Date().getFullYear().toString();
        const requestCode = `${firstPart}-${secondPart}${thirdPart.slice(2)}`;

        const request = await RequestModel.create({
            userId: _id,
            status: 'PENDING',
            requestCode,
            ...data
        });

        let smsStatuses = [];
        if (driverPhones.length) {
            for (const number of driverPhones) {
                const status = await smsSender(`Your have common request ${request.requestCode}`, number);
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
            };
        }
        const successEmailsCount = emailStatuses.map(item => item === 202);

        const totalDrivers = smsStatuses.length + successEmailsCount.length;

        return {
            request,
            message: `Your request successfully sent to ${totalDrivers} drivers`,
        }
    }

    async driverOneCallAnswer({ requestId, answer }, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, 'DRIVER');

        const status = answer ? 'ACTIVE' : 'REJECTED';

        const request = await RequestModel.findOneAndUpdate(
            { _id: requestId },
            {
                $set: { status }
            },
            { new: true },
        )
        if (!request) {
            throw new GraphQLError("Modified forbidden")
        }

        const { email, phone: { number, confirmed } } = await findUserById(request.userId)
        if (number && confirmed) {
            await smsSender(`Your request ${request.requestCode} has been ${status ? 'approved' : 'rejected'}`, number);
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Request answer',
                text: `Your request ${request.requestCode} has been ${status ? 'approved' : 'rejected'}`,
                html: `
                    <h2>Your request ${request.requestCode} has been ${status ? 'approved' : 'rejected'}</h2>                        
                `,
            });
        }

        return request;
    }

    async driverMultiCallAnswer({ requestId, answer }, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, 'DRIVER');

        const status = answer ? 'APPROVED' : 'REJECTED';

        const request = await RequestModel.findOneAndUpdate(
            { _id: requestId },
            {
                $set: { status, driverId: _id }
            },
            { new: true },
        );
        if (!request) throw new GraphQLError("Modified forbidden");

        const { email, phone: { number, confirmed } } = await findUserById(request.userId);

        if (number && confirmed) {
            await smsSender(`Your request ${request.requestCode} has been ${answer ? 'approved' : 'rejected'}`, number);
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Request status',
                text: `Your request ${request.requestCode} has been ${answer ? 'approved' : 'rejected'}`,
                html: `
                        <h2>Your request ${request.requestCode} has been ${answer ? 'approved' : 'rejected'}</h2>                        
                    `,
            });
        }
        return request;
    }

    async riderMultiCallAnswer({ requestId, answer }, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, 'RIDER');

        let request;
        if (answer) {
            request = await RequestModel.findOneAndUpdate(
                { _id: requestId },
                {
                    $set: { status: 'ACTIVE' }
                },
                { new: true },
            );
        } else {
            request = await RequestModel.findOneAndUpdate(
                { _id: requestId },
                {
                    $set: { status: 'PENDING', driverId: null }
                },
                { new: false },
            );
        }
        if (!request) throw new GraphQLError("Modified forbidden");

        const { email, phone: { number, confirmed } } = await findUserById(request.driverId);

        if (number && confirmed) {
            await smsSender(`The request ${request.requestCode} has been ${answer ? 'approved' : 'rejected'}`, number);
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Request status',
                text: `The request ${request.requestCode} has been ${answer ? 'approved' : 'rejected'}`,
                html: `
                        <h2>The request ${request.requestCode} has been ${answer ? 'approved' : 'rejected'}</h2>                        
                    `,
            });
        }
        return request;
    }

    async changeRequestStatus(requestId, status, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, 'RIDER');

        const request = await RequestModel.findOneAndUpdate(
            { _id: requestId },
            {
                $set: { status }
            },
            { new: true },
        )
        if (!request) {
            throw new GraphQLError("Modified forbidden")
        }

        const { email, phone: { number, confirmed } } = await findUserById(request.driverId);

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

        return request;
    }

    async finishedRequestByDriver(id, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const request = await RequestModel.findOneAndUpdate(
            { _id: id },
            {
                $set: { status: "FINISHED" }
            },
            { new: true },
        )
        if (!request) {
            throw new GraphQLError("Modified forbidden")
        } else return request;
    }

    async getAllRequestsByStatus(status, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const userPopulatedFields = ['_id', 'userName', 'avatarURL'];
        const requests = await RequestModel.find({ status })
            .populate({ path: 'userId', select: userPopulatedFields });

        return requests;
    }

    async getFinishedRequestsByDriver(id, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const requests = await RequestModel.find({
            status: 'FINISHED',
            driverId: id,
        });

        return requests;
    }

    async getNotFinishedRequests() {

        const requests = await RequestModel.find({
            status: { $not: { $eq: 'FINISHED' } },
        });

        return requests;
    }

}

export default new RequestService;