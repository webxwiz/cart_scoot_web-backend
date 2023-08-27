import crypto from 'crypto';

import { GraphQLError } from 'graphql';

import RequestModel from '../models/Request.js';
import UserModel from '../models/User.js';

import { checkAuth, findUserById, findUserByIdAndRole, mailSender, smsSender } from '../utils/_index.js';


class RequestService {

    async getRequest(id, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const request = await RequestModel.findById(id);
        if (!request) {
            throw new GraphQLError("Can't find request")
        } else return request;
    }

    async getAllRequestsByFilters(
        { status, page, searchRequestCode, searchPickupLocation, searchDropoffLocation }, token) {
        const { _id } = checkAuth(token);
        await findUserById(_id);

        const validPage = page ? page > 0 ? page : 1 : 1;

        const requests = await RequestModel.find
            ({
                userId: _id,
                ...(status && { status }),
                ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
                ...(searchPickupLocation && { pickupLocation: { $regex: searchPickupLocation, $options: 'i' } }),
                ...(searchDropoffLocation && { dropoffLocation: { $regex: searchDropoffLocation, $options: 'i' } }),
            })
            .limit(6 * validPage)
            .sort({ createdAt: -1 })
            .populate('driverId');

        return requests;
    }

    async createOneDriverRequest({ id, ...data }, role, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, role);
        const { email, phone } = await findUserById(id);

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

        let status = '';
        if (phone) {
            status = await smsSender('Your private information', phone);
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

        return { request, status };
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
        const driverPhones = driverArray.map(user => user.phone).filter(phone => phone !== null);

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
            emailStatuses.push(status);
        };

        const totalDrivers = smsStatuses.length + emailStatuses.length;

        return {
            request,
            message: `Your request successfully sent to ${totalDrivers} drivers`,
        }
    }

    async userAnswer(id, status, role, token) {
        const { _id } = checkAuth(token);
        const { email, phone } = await findUserByIdAndRole(_id, role);

        if (phone) {
            await smsSender('Your private information', phone);
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
        const { email, phone } = await findUserByIdAndRole(_id, role);

        if (phone) {
            await smsSender('Your private information', phone);
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
        const { email, phone } = await findUserByIdAndRole(_id, role);

        if (phone) {
            await smsSender('Your private information', phone);
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