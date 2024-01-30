import nodemailer, { createTransport } from "nodemailer";

export const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (toMail, subject, body) => {
    await transporter.sendMail({
        from: process.env.FROM_EMAIL, // sender address
        to: toMail, // list of receivers
        subject: subject, // Subject line
        html: body, // html body
    });

}
