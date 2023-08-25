import ReviewModel from '../models/Review.js';

import { checkAuth, findUserById, findUserByIdAndRole, smsSender, logger } from '../utils/_index.js';

class ReviewService {

    async addReview({ id, ...data }, role, token) {
        const { _id } = checkAuth(token);
        const user = await findUserByIdAndRole(_id, role);

        const { email, phone: { number, confirmed } } = await findUserById(id);

        if (number && confirmed) {
            await smsSender('Your private information', number);
        } else if (email) {
            try {
                await mailSender({
                    to: email,
                    subject: 'Your subject',
                    text: 'Your text',
                    html: `
                        <h2>Your HTML</h2>                        
                    `,
                });
            } catch (err) {
                logger.error(err.message || "Can't send email")
            }
        }

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