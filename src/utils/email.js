const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;
const logger = require("./logger");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendConfirmationEmail = async (userEmail, userLogin, link) => {
    try {
        const token = jwt.sign({ email: userEmail }, SECRET_KEY, { expiresIn: '1h' });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Email Confirmation',
            html: `
                <h3>Hello ${userLogin},</h3>
                <p>Please click the link below to confirm your email:</p>
                <a href="${link}">Confirm Email</a>
                <p>This link will expire in 1 hour.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        logger.info(`Confirmation email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        throw new Error('Error sending confirmation email');
    }
};

module.exports = {
    sendConfirmationEmail,
};
