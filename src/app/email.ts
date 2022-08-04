import { SMTPClient } from "emailjs";

export async function sendEmail(
    receiver: string,
    subject: string,
    text: string | string[]
) {
    const client = new SMTPClient({
        host: process.env.EMAIL_HOST,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        ssl: true,
    });

    client.sendAsync({
        from: process.env.EMAIL_USER as string,
        to: receiver,
        subject: subject,
        text: Array.isArray(text) ? text.join("\n") : text,
    });
}
