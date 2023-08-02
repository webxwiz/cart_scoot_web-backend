import ReviewModel from '../models/Review.js';

import { checkAuth, findUserById } from '../utils/_index.js';

class ReviewService {

    async addReview({ id, text, rating }, token) {
        const { _id } = checkAuth(token);
        const user = await findUserById(_id);

        const review = await ReviewModel.create({
            createdBy: user.userName,
            driver: id,
            text,
            rating,
        });

        return review;
    }

    async getReviewsById(_id) {       
        const reviews = await ReviewModel.find({ driver: _id });
       
        return reviews;
    }
}

export default new ReviewService;