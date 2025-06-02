const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const APIError = require('../utils/APIError');

class NotificationService {
  constructor() {
    if (process.env.EMAIL_ENABLED === 'true') {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });

      this.transporter.verify((error) => {
        if (error) {
          logger.error(`Mail server connection failed: ${error.message}`);
        } else {
          logger.info('Mail server connection established');
        }
      });
    } else {
      logger.warn('Email notifications are disabled (EMAIL_ENABLED != true)');
    }
  }

  /**
   * Send email notification
   * @param {Object} options
   * @param {string|string[]} options.to - Recipient(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} [options.html] - HTML content
   * @param {Object[]} [options.attachments] - Email attachments
   * @returns {Promise<Object>} Send result
   */
  async sendEmail({ to, subject, text, html, attachments }) {
    try {
      // If email is disabled, log and return
      if (process.env.EMAIL_ENABLED !== 'true') {
        logger.info(`[Email Disabled] Would send to ${to}: ${subject}`);
        return { messageId: 'simulated' };
      }

      const mailOptions = {
        from: `"Employee Performance System" <${process.env.EMAIL_FROM}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html: html || text,
        attachments: attachments || []
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Email failed to ${to}: ${error.message}`, { error });
      throw new APIError('Email sending failed', 500);
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} resetToken - Password reset token
   * @returns {Promise}
   */
  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const expiration = process.env.PASSWORD_RESET_EXPIRATION || '10 minutes';

    const text = `You requested a password reset. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in ${expiration}.\n\nIf you didn't request this, please ignore this email.`;

    const html = `
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in ${expiration}.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text,
      html
    });
  }

  /**
   * Send performance review notification
   * @param {string} email - Reviewer email
   * @param {string} revieweeName - Name of employee being reviewed
   * @param {Date} dueDate - Due date for review
   * @returns {Promise}
   */
  async sendReviewNotification(email, revieweeName, dueDate) {
    const formattedDate = dueDate.toLocaleDateString();
    const reviewUrl = `${process.env.FRONTEND_URL}/reviews`;

    const text = `You have been assigned to complete a performance review for ${revieweeName} by ${formattedDate}.\n\nPlease log in to complete the review:\n${reviewUrl}`;

    const html = `
      <p>You have been assigned to complete a performance review for <strong>${revieweeName}</strong> by <strong>${formattedDate}</strong>.</p>
      <p><a href="${reviewUrl}">Complete Review</a></p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'New Performance Review Assignment',
      text,
      html
    });
  }

  /**
   * Send goal assignment notification
   * @param {string} email - Employee email
   * @param {string} goalTitle - Goal title
   * @param {Date} targetDate - Goal target date
   * @returns {Promise}
   */
  async sendGoalAssignment(email, goalTitle, targetDate) {
    const formattedDate = targetDate.toLocaleDateString();
    const goalsUrl = `${process.env.FRONTEND_URL}/goals`;

    const text = `A new goal "${goalTitle}" has been assigned to you with a target date of ${formattedDate}.\n\nView your goals:\n${goalsUrl}`;

    const html = `
      <p>A new goal <strong>"${goalTitle}"</strong> has been assigned to you with a target date of <strong>${formattedDate}</strong>.</p>
      <p><a href="${goalsUrl}">View Your Goals</a></p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'New Goal Assignment',
      text,
      html
    });
  }

  /**
   * Send review completion notification
   * @param {string} employeeEmail - Employee email
   * @param {string} reviewerName - Reviewer name
   * @returns {Promise}
   */
  async sendReviewCompletion(employeeEmail, reviewerName) {
    const reviewsUrl = `${process.env.FRONTEND_URL}/reviews`;

    const text = `${reviewerName} has completed your performance review. You can now view the feedback:\n${reviewsUrl}`;

    const html = `
      <p><strong>${reviewerName}</strong> has completed your performance review.</p>
      <p><a href="${reviewsUrl}">View Feedback</a></p>
    `;

    return this.sendEmail({
      to: employeeEmail,
      subject: 'Your Performance Review is Complete',
      text,
      html
    });
  }

  /**
   * Send system notification (DB/web socket placeholder)
   * @param {Object} options
   * @param {string|string[]} options.userId - Target user ID(s)
   * @param {string} options.message - Notification message
   * @param {string} [options.type='system'] - Notification type
   * @param {Object} [options.metadata] - Additional data
   * @returns {Promise<boolean>} Success status
   */
  async sendSystemNotification({ userId, message, type = 'system', metadata = {} }) {
    try {
      // In a real implementation, this would:
      // 1. Save to Notification model
      // 2. Push via WebSocket
      // 3. Integrate with mobile push services
      
      const userIds = Array.isArray(userId) ? userId : [userId];
      logger.info(`System notification to users [${userIds.join(', ')}]: ${message}`, {
        type,
        metadata
      });
      
      return true;
    } catch (error) {
      logger.error(`System notification failed: ${error.message}`, { error });
      return false;
    }
  }

  /**
   * Send account activation email
   * @param {string} email - User email
   * @param {string} activationToken - Activation token
   * @returns {Promise}
   */
  async sendAccountActivation(email, activationToken) {
    const activationUrl = `${process.env.FRONTEND_URL}/activate?token=${activationToken}`;

    const text = `Welcome to our platform! Please activate your account:\n\n${activationUrl}`;

    const html = `
      <p>Welcome to our platform! Please click the link below to activate your account:</p>
      <p><a href="${activationUrl}">Activate Account</a></p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Activate Your Account',
      text,
      html
    });
  }
}

// Singleton instance
const notificationService = new NotificationService();
module.exports = notificationService;