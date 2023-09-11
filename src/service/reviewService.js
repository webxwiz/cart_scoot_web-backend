import ReviewModel from '../models/Review.js';

import { checkAuth, findUserById, findUserByIdAndRole, smsSender, mailSender, logger } from '../utils/_index.js';

class ReviewService {

    async addReview(data, token) {
        const { _id } = checkAuth(token);
        await findUserByIdAndRole(_id, 'RIDER');
        const { driverId } = data;

        // const { email, phone: { number, confirmed } } = await findUserById(driverId);

        // if (number && confirmed) {
        //     await smsSender('Your private information', number);
        // } else if (email) {
        //     await mailSender({
        //         to: email,
        //         subject: 'Your subject',
        //         text: 'Your text',
        //         html: `
        //                 <h2>Your HTML</h2>                        
        //             `,
        //     });
        // };

        const review = await ReviewModel.create({
            createdBy: _id,
            ...data,
        });

        return review;
    }

    async getReviewsById(driverId) {
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
}

export default new ReviewService;