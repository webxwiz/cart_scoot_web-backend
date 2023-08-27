import ReviewModel from '../models/Review.js';

import { checkAuth, findUserById, findUserByIdAndRole, smsSender, mailSender, logger } from '../utils/_index.js';

class ReviewService {

    async addReview({ id, ...data }, role, token) {
        const { _id } = checkAuth(token);
        const user = await findUserByIdAndRole(_id, role);

        const { email, phone } = await findUserById(id);

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
        };

        const review = await ReviewModel.create({
            createdBy: user.userName,
            driverId: id,
            ...data,
        });

        return review;
    }

    async getReviewsById(_id) {
        const reviews = await ReviewModel.find({ driverId: _id });

        return reviews;
    }
}

export default new ReviewService;