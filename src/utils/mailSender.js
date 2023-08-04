import nodemailer from 'nodemailer';

import 'dotenv/config';

const transport = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

export const resetPasswordSender = async (token, email) => {

    const message = {
        from: `"Cart Scoot Web" <${process.env.EMAIL_ADDRESS}>`,
        to: email,
        subject: 'Restore password',
        text: 'Please, follow the link to set new password',
        html: `
            <h2>Please, follow the link to set new password</h2>
            <h4>If you don't restore your password ignore this mail</h4>
            <hr/>
            <br/>
            <a href='${process.env.FRONT_URL}/auth/reset/${token}'>Link for set new password</a>
        `
    };

    const status = await transport.sendMail(message);

    return status;
}

export const requestSender = async (email) => {

    const message = {
        from: `"Cart Scoot Web" <${process.env.EMAIL_ADDRESS}>`,
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
        `
    };

    const status = await transport.sendMail(message);

    return status;

}

export const banUserSender = async (email) => {

    const message = {
        from: `"Cart Scoot Web" <${process.env.EMAIL_ADDRESS}>`,
        to: email,
        subject: 'Banned information',
        text: 'Your account banned',
        html: `
            <h2>Hello!</h2>
            <h2>You account has been banned by administrator. Please contact for details</h2>
            <h4>Please, follow the link for more details</h4>
            <hr/>
            <br/>
            <a href='${process.env.FRONT_URL}/contacts'>Contact link</a>
        `
    };

    const status = await transport.sendMail(message);

    return status;

}
