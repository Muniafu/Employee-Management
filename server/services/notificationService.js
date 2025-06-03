import nodemailer from 'nodemailer';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: config.email.smtpHost,
  port: config.email.smtpPort,
  secure: config.email.smtpSecure,
  auth: {
    user: config.email.smtpUser,
    pass: config.email.smtpPassword,
  },
});

/**
 * Service for sending notifications
 */
class NotificationService {
  /**
   * Send email notification
   * @param {Object} options - Email options
   * @returns {Promise<void>}
   */
  static async sendEmail(options) {
    try {
      await transporter.sendMail({
        from: `"Performance System" <${config.email.from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      throw new APIError(500, 'Failed to send email');
    }
  }

  /**
   * Notify employee about new review
   * @param {string} reviewId - Review ID
   * @returns {Promise<void>}
   */
  static async notifyNewReview(reviewId) {
    const review = await Review.findById(reviewId)
      .populate({
        path: 'employee',
        populate: { path: 'user' }
      })
      .populate('reviewer');

    if (!review) {
      throw new APIError(404, 'Review not found');
    }

    const subject = `New Performance Review Submitted`;
    const text = `Hello ${review.employee.fullName},\n\n` +
      `A new performance review has been submitted by ${review.reviewer.name}.\n` +
      `Review Period: ${review.reviewPeriod.startDate.toDateString()} - ${review.reviewPeriod.endDate.toDateString()}\n\n` +
      `Please log in to the system to view details.\n\n` +
      `Best regards,\nPerformance System Team`;

    await this.sendEmail({
      to: review.employee.user.email,
      subject,
      text
    });
  }

  /**
   * Notify manager about completed goal
   * @param {string} goalId - Goal ID
   * @returns {Promise<void>}
   */
  static async notifyGoalCompletion(goalId) {
    const goal = await Goal.findById(goalId)
      .populate({
        path: 'employee',
        populate: { path: 'user' }
      })
      .populate('createdBy');

    if (!goal) {
      throw new APIError(404, 'Goal not found');
    }

    // Find manager users to notify
    const managers = await User.find({ role: 'manager' });

    if (managers.length === 0) return;

    const subject = `Goal Completed: ${goal.title}`;
    const text = `Hello,\n\n` +
      `The following goal has been marked as completed:\n\n` +
      `Employee: ${goal.employee.fullName}\n` +
      `Goal: ${goal.title}\n` +
      `Completed on: ${goal.completionDate.toDateString()}\n\n` +
      `Please log in to the system to review.\n\n` +
      `Best regards,\nPerformance System Team`;

    await Promise.all(
      managers.map(manager => 
        this.sendEmail({
          to: manager.email,
          subject,
          text
        })
      )
    );
  }

  /**
   * Notify employee about overdue goals
   * @param {string} employeeId - Employee ID
   * @returns {Promise<void>}
   */
  static async notifyOverdueGoals(employeeId) {
    const employee = await Employee.findById(employeeId)
      .populate('user');

    if (!employee) {
      throw new APIError(404, 'Employee not found');
    }

    const overdueGoals = await Goal.find({
      employee: employeeId,
      status: { $ne: 'completed' },
      targetDate: { $lt: new Date() }
    });

    if (overdueGoals.length === 0) return;

    const subject = `You have ${overdueGoals.length} overdue goal(s)`;
    const text = `Hello ${employee.fullName},\n\n` +
      `You have ${overdueGoals.length} goal(s) that are overdue:\n\n` +
      `${overdueGoals.map(goal => `- ${goal.title} (Due: ${goal.targetDate.toDateString()})`).join('\n')}\n\n` +
      `Please update the status of these goals in the system.\n\n` +
      `Best regards,\nPerformance System Team`;

    await this.sendEmail({
      to: employee.user.email,
      subject,
      text
    });
  }
}

export default NotificationService;