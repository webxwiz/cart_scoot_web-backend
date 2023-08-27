import twilio from "twilio";

import 'dotenv/config';

import { logger } from './_index.js';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const smsSender = async (body, to) => {

    let status;

    try {
        status = await client.messages
            .create({
                body,
                to,
                from: process.env.TWILIO_PHONE_NUMBER,
            });
    } catch (err) {
        logger.error(err.message + `: Can't send sms to ${to}`)
    }

    return status?.sid;
}