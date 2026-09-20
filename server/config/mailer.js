const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  console.log('[MAIL] SMTP Transporter initialized.');
} else {
  console.log('[MAIL] SMTP credentials not set. Email dispatch will mock log to stdout.');
}

module.exports = transporter;