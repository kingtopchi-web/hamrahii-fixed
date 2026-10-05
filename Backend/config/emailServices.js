import sendEmail from "./sendEmail.js";
import { emailTypes } from "../utils/emailType.js";

export const sendEmailByType = async (type, to, data) => {
    const config = emailTypes[type];
    if (!config) {
        throw new Error(`Email type "${type}" not found`);
    }

    const subject = config.subject;
    const html = config.template(data);

    await sendEmail({ to, subject, html });
};
