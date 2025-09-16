const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email utility
 * - Never throws, only logs errors
 * - Always resolves so business logic continues
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"EMS System" <no-reply@ems.com>',
      to,
      subject,
      text,
      html,
    });
    console.log("📧 Email sent:", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    // Don't break business logiv
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };