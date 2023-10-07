import { Types } from 'mongoose';

import ReviewModel from '../models/Review.js';

import { checkAuth, findUserById, findUserByIdAndRole, smsSender, mailSender, logger } from '../utils/_index.js';

class ReviewService {

    async addReview(data, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, 'RIDER');
        const { driverId } = data;

        const { email, phone: { number, confirmed } } = await findUserById(driverId);

        if (number && confirmed) {
            await smsSender(`Your have new review! Your rating ${data.rating}. Message: ${data.text}`, number);
        } else if (email) {
            await mailSender({
                to: email,
                subject: 'Your have new review!',
                text: 'Your have new review!',
                html: `
                        <h2>Your have new review!</h2>
                        <h4>Your rating ${data.rating}</h4>
                        <p>Message:</p>                      
                        <p>${data.text}</p>                      
                    `,
            });
        };

        const review = await ReviewModel.create({
            createdBy: _id,
            ...data,
        });

        return review;
    }

    async getReviewsByDriverId(
        { page, searchRequestCode, dateFrom, dateTo, driverId }) {

        const validPage = page ? page > 0 ? page : 1 : 1;
        const userPopulatedFields = ['_id', 'userName', 'avatarURL'];

        const reviews = await ReviewModel.find
            ({
                driverId,
                createdAt: { $gte: new Date(dateFrom || '2020-12-17T03:24:00'), $lte: new Date(dateTo || Date.now()) },
                ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
            })
            .limit(6 * validPage)
            .sort({ createdAt: -1 })
            .populate({ path: 'createdBy', select: userPopulatedFields })
            .populate({ path: 'driverId', select: userPopulatedFields });

        const totalCount = (await ReviewModel.find
            ({
                driverId,
                createdAt: { $gte: new Date(dateFrom || '2020-12-17T03:24:00'), $lte: new Date(dateTo || Date.now()) },
                ...(searchRequestCode && { requestCode: { $regex: searchRequestCode, $options: 'i' } }),
            })).length;

        return { reviews, totalCount };
    }

    async getDriverRating(token) {
        const { _id } = checkAuth(token);

        const driverReviews = await ReviewModel
            .aggregate()
            .match({ driverId: new Types.ObjectId(_id) })
            .group({
                _id: '$driverId',
                totalCount: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            });

        let avgRating = 0;
        let totalCount = 0;
        if (driverReviews?.length) {
            avgRating = Math.round(driverReviews[0]?.avgRating * 10) / 10;
            totalCount = driverReviews[0].totalCount;
        }

        return { totalCount, avgRating };
    }
}

export default new ReviewService;
