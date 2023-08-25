import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const smsSender = async (body, to) => {

    return await client.messages
        .create({
            body,
            to, 
            from: process.env.TWILIO_PHONE_NUMBER,
        })

}