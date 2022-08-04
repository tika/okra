import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

function sendEmail(receiver: string, subject: string, text: string) {
    transporter.sendMail(
        { from: process.env.EMAIL_USER, to: receiver, subject, text },
        (error, info) => {
            if (error) {
                throw error;
            } else {
                return info;
            }
        }
    );
}
