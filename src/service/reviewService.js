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

    async getReviewsByDriverId(driverId) {
        const userPopulatedFields = ['_id', 'userName', 'avatarURL'];
        const reviews = await ReviewModel.find({ driverId })
            .populate({ path: 'createdBy', select: userPopulatedFields })
            .populate({ path: 'driverId', select: userPopulatedFields });

        return reviews;
    }

    async getAllReviews(pageNumber) {
        const validatePageNumber = pageNumber > 0 ? pageNumber : 1;
        const reviewsOnPage = 50;
        const reviews = await ReviewModel.find()
            .sort({ createdAt: -1 })
            .limit(reviewsOnPage)
            .skip((validatePageNumber - 1) * reviewsOnPage);;

        return reviews;
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