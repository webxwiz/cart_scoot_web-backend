import sgMail from "@sendgrid/mail";
import { GraphQLError } from 'graphql';

import { logger } from './_index.js';

import 'dotenv/config';

sgMail.setApiKey(process.env.SG_API_KEY);

export const mailSender = async ({ to, subject, text, html }) => {

    const message = {
        from: `"Cart Scoot Web" <${process.env.SG_EMAIL_ADDRESS}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        return await sgMail.send(message);
    } catch (err) {
        logger.error(err.message || "Can't send email");
        throw new GraphQLError(err.message || "Can't send email")
    }
}
