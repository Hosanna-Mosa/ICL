import nodemailer from "nodemailer";

// Direct Gmail credentials (App Password)
const GMAIL_USER = process.env.EMAIL_USER || "laptoptest7788@gmail.com";
const GMAIL_APP_PASSWORD =   process.env.EMAIL_PASS || "uqfiabjkiqudrgdw";
const FROM_ADDRESS = process.env.EMAIL_FROM ||  "BRELIS Streetwear <laptoptest7788@gmail.com>";

// Explicit Gmail SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // TLS
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise}
 */
export async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}

export default { sendEmail };
