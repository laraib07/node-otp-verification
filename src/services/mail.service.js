import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // use SSL
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    }
});

const mailSender = async (email, subject, body) => {
    const response = await transporter.sendMail({
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: subject,
        html: body,
    });

    return response;
}

export { mailSender };