const nodemailer = require("nodemailer");
const CredentialsManager = require('../utils/credentialsManager');
const credentialsManager = new CredentialsManager();
const host = "smtp.gmail.com";


async function sendSmtpMessage(to, subject, textAsHtml) {
    const credentials = credentialsManager.getCredentials();
    const transporter = nodemailer.createTransport({
        host: host,
        port: 465,
        secure: true,
        auth: {
            user: credentials.email,
            pass: credentials.password
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    const message = {
        from: credentials.email,
        to: to,
        subject: subject,
        text: textAsHtml.replace(/<[^>]+>/g, ''),
        html: textAsHtml
    }

    const response = await transporter.sendMail(message);
    console.log(response);
}


module.exports = {
    sendSmtpMessage
};