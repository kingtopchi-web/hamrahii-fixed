
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: "humrahiiofficial@gmail.com",
        pass: "xrjo qppz fzac nnvk" 
    }
});

const sendEmail = async ({ to, subject, html, bcc }) => {
    try {
        await transporter.sendMail({
            from: "humrahiiofficial@gmail.com",
            to,
            subject,
            html,
            bcc
        });
        console.log(`✅ Email sent to ${to}`);
    } catch (err) {
        console.error("❌ Email sending failed:", err.message);
    }
};

export default sendEmail;
