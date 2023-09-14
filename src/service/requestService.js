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

        const userPopulatedFields = ['_id', 'userName', 'avatarURL'];
        const request = await RequestModel.findById(id)
            .populate({ path: 'driverId', select: userPopulatedFields });
        if (!request) {
            throw new GraphQLError("Can't find request")
        };
        const driverReviews = await ReviewModel
            .aggregate()
            .match({ driverId: request.driverId._id })
            .group({
                _id: '$driverId',
                totalCount: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            });
        const avgRating = Math.round(driverReviews[0].avgRating * 10) / 10;

        return { request, avgRating };
    }

    async getAllRequestsByFilters(
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

        let status = {};
        if (number && confirmed) {
            status = await smsSender('Your private information', number);
        } else if (email) {
            status = await mailSender({
                to: email,
                subject: 'Car Rent Request',
                text: 'New car rent request!',
                html: `
                    <h2>Hello!</h2>
                    <h2>You have new car rent request!</h2>
                    <h4>Please, follow the link for more details</h4>
                    <hr/>
                    <br/>
                    <a href='${process.env.FRONT_URL}/requestsList'>Link for details</a>
                `,
            });
        }

        return { request, status: status[0].statusCode };
    }

    async createDriversRequest({ ...data }, role, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, role);

        const dayOfWeek = new Date(requestedTime).getDay();
        const hour = new Date(requestedTime).getHours();

        const driverArray = await UserModel.find({
            workingDays: { $in: dayOfWeek },
            'workingTime.from': { $lte: hour },
            'workingTime.to': { $gt: hour },
        });
        const driverEmails = driverArray.map(user => user.email).filter(email => email !== null);
        const driverPhones = driverArray.map(user => user.phone.number).filter(item => item !== null);

        const firstPart = crypto.randomBytes(3).toString('hex');
        const secondPart = crypto.randomBytes(2).toString('hex');
        const thirdPart = new Date().getFullYear().toString();
        const requestCode = `${firstPart}-${secondPart}${thirdPart.slice(2)}`;

        const request = await RequestModel.create({
            userId: _id,
            driverId: id,
            status: 'PENDING',
            requestCode,
            ...data
        });

        let smsStatuses = [];
        for (const number of driverPhones) {
            const status = await smsSender('Your private information', number);
            smsStatuses.push(status);
        }

        let emailStatuses = [];
        for (const email of driverEmails) {
            const status = await mailSender({
                to: email,
                subject: 'Car Rent Request',
                text: 'New car rent request!',
                html: `
                    <h2>Hello!</h2>
                    <h2>You have new car rent request!</h2>
                    <h4>Please, follow the link for more details</h4>
                    <hr/>
                    <br/>
                    <a href='${process.env.FRONT_URL}/requestsList'>Link for details</a>
                `,
            });
            emailStatuses.push(status[0].statusCode);
        };
        const successEmailsCount = emailStatuses.map(item => item === 202);

        const totalDrivers = smsStatuses.length + successEmailsCount.length;

        return {
            request,
            message: `Your request successfully sent to ${totalDrivers} drivers`,
        }
    }

    async userAnswer(id, status, role, token) {
        const { _id } = checkAuth(token);
        const { email, phone: { number, confirmed } } = await findUserByIdAndRole(_id, role);

        if (number && confirmed) {
            await smsSender('Your private information', number);
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Your subject',
                text: 'Your text',
                html: `
                    <h2>Your HTML</h2>                        
                `,
            });
        }

        const request = await RequestModel.findOneAndUpdate(
            { _id: id },
            {
                $set: { status }
            },
            { new: true },
        )
        if (!request) {
            throw new GraphQLError("Modified forbidden")
        } else return request;
    }

    async cancelUserRequest(id, role, token) {
        const { _id } = checkAuth(token);
        const { email, phone: { number, confirmed } } = await findUserByIdAndRole(_id, role);

        if (number && confirmed) {
            await smsSender('Your private information', number);
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Your subject',
                text: 'Your text',
                html: `
                    <h2>Your HTML</h2>                        
                `,
            });
        }

        const requestStatus = await RequestModel.deleteOne({ _id: id });

        return requestStatus;
    }

    async finishRequest(id, role, token) {
        const { _id } = checkAuth(token);
        const { email, phone: { number, confirmed } } = await findUserByIdAndRole(_id, role);

        if (number && confirmed) {
            await smsSender('Your private information', number);
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Your subject',
                text: 'Your text',
                html: `
                    <h2>Your HTML</h2>                        
                `,
            });
        }

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

        const requests = await RequestModel.find({ status });

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