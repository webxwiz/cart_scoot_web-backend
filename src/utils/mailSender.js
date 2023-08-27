import nodemailer from 'nodemailer';

import 'dotenv/config';

import { logger } from './_index.js';

const transport = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

export const mailSender = async ({ to, subject, text, html }) => {

    const message = {
        from: `"Cart Scoot Web" <${process.env.EMAIL_ADDRESS}>`,
        to,
        subject,
        text,
        html,
    };

    let status;

    try {
        status = await transport.sendMail(message);        
    } catch (err) {        
        logger.error(err.message + `: Can't send email to ${to}`)
    }

    return status?.response;
}
