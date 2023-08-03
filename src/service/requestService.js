import { GraphQLError } from 'graphql';

import RequestModel from '../models/Request.js';
import UserModel from '../models/User.js';

import { checkAuth, requestSender, findUserById, logger } from '../utils/_index.js';


class RequestService {

    async getRequest(id, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const request = await RequestModel.findById(id);
        if (!request) {
            throw new GraphQLError("Can't find request")
        } else return request;
    }

    async createOneDriverRequest({ id, description, carType, requestedTime }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);
        const driver = await findUserById(id);

        const request = await RequestModel.create({
            createdBy: user.userName,
            driverId: id,
            description,
            status: 'PENDING',
            carType,
            requestedTime,
        });

        if (!request) {
            throw new GraphQLError('Database Error', { extensions: { code: 'DATABASE_ERROR' } })
        }

        let status = '';
        try {
            status = await requestSender(driver.email);
        } catch (err) {
            logger.error(err.message || "Can't send email")
        }

        return { request, status };
    }

    async createDriversRequest({ description, carType, requestedTime }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        const dayOfWeek = new Date(requestedTime).getDay();
        const hour = new Date(requestedTime).getHours();

        const driverArray = await UserModel.find({
            workingDays: { $in: dayOfWeek },
            'workingTime.from': { $lte: hour },
            'workingTime.to': { $gt: hour },
        });
        const driverEmails = driverArray.map(user => user.email);

        const request = await RequestModel.create({
            createdBy: user.userName,
            description,
            status: 'PENDING',
            carType,
            requestedTime,
        });

        let statusArray = [];
        for (const email of driverEmails) {
            try {
                const status = await requestSender(email);
                statusArray.push(status);
            } catch (err) {
                logger.error(err.message || "Can't send email")
            }
        };

        if (statusArray.length === driverEmails.length) {
            return {
                request,
                message: 'All emails successfully sent',
            }
        } else if (!statusArray.length) {
            return {
                request,
                message: "Can't sent any emails",
            }
        } else {
            return {
                request,
                message: "Emails particularly sent",
            }
        }
    }

    async userAnswer(id, status, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

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

    async cancelUserRequest(id, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const requestStatus = await RequestModel.deleteOne({ _id: id });

        return requestStatus;
    }

    async finishRequest(id, token) {
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