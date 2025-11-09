const nodemailer = require('nodemailer');

// Create transporter for email sending
const createTransporter = () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASS) {
    throw new Error('Email credentials not configured');
  }
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASS
    },
    tls: {
      rejectUnauthorized: true, // Enforce certificate validation
      minVersion: 'TLSv1.2' // Enforce minimum TLS version
    },
    requireTLS: true // Require TLS encryption
  });
};

class EmailService {
  /**
   * Send welcome email to new user
   * @param {string} email - User's email
   * @param {string} name - User's name
   */
  async sendWelcomeEmail(email, name) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'Welcome to VNR Parking System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to VNR Parking System, ${name}!</h2>
            <p>Thank you for registering with us. Your account has been successfully created.</p>
            <p>You can now:</p>
            <ul>
              <li>Register your vehicles for parking</li>
              <li>View your parking history</li>
              <li>Manage your vehicle information</li>
            </ul>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br>VNR Parking Team</p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send vehicle registration confirmation email
   * @param {string} email - User's email
   * @param {string} name - User's name
   * @param {Object} vehicleData - Vehicle information
   */
  async sendVehicleRegistrationEmail(email, name, vehicleData) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'Vehicle Registration Confirmation - VNR Parking',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Vehicle Registration Confirmed</h2>
            <p>Dear ${name},</p>
            <p>Your vehicle has been successfully registered in our parking system.</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2563eb;">Vehicle Details:</h3>
              <p><strong>Vehicle Type:</strong> ${vehicleData.vehicle_type}</p>
              <p><strong>Vehicle Number:</strong> ${vehicleData.vehicle_number}</p>
              <p><strong>Model:</strong> ${vehicleData.model || 'Not specified'}</p>
              <p><strong>Color:</strong> ${vehicleData.color || 'Not specified'}</p>
              <p><strong>Electric Vehicle:</strong> ${vehicleData.is_ev ? 'Yes' : 'No'}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>You will receive notifications about parking availability and important updates.</p>

            <br>
            <p>Best regards,<br>VNR Parking Team</p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Vehicle registration email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending vehicle registration email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send admin notification for new vehicle registration
   * @param {Object} vehicleData - Vehicle information
   * @param {string} userEmail - User's email
   */
  async sendAdminNotification(vehicleData, userEmail) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: process.env.ADMIN_EMAIL, // Send to admin
        subject: 'New Vehicle Registration - Admin Notification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">New Vehicle Registration</h2>
            <p>A new vehicle has been registered in the system.</p>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">Registration Details:</h3>
              <p><strong>User Email:</strong> ${userEmail}</p>
              <p><strong>Vehicle Type:</strong> ${vehicleData.vehicle_type}</p>
              <p><strong>Vehicle Number:</strong> ${vehicleData.vehicle_number}</p>
              <p><strong>Owner Name:</strong> ${vehicleData.owner_name}</p>
              <p><strong>Model:</strong> ${vehicleData.model || 'Not specified'}</p>
              <p><strong>Color:</strong> ${vehicleData.color || 'Not specified'}</p>
              <p><strong>Electric Vehicle:</strong> ${vehicleData.is_ev ? 'Yes' : 'No'}</p>
              <p><strong>Employee/Student ID:</strong> ${vehicleData.employee_student_id}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>Please review and approve the registration if needed.</p>

            <br>
            <p>VNR Parking System</p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Admin notification sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send status update notification
   * @param {string} email - User's email
   * @param {string} name - User's name
   * @param {string} vehicleNumber - Vehicle number
   * @param {string} status - New status
   * @param {string} message - Additional message
   */
  async sendStatusUpdateEmail(email, name, vehicleNumber, status, message = '') {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: `Vehicle Status Update - ${vehicleNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Vehicle Status Update</h2>
            <p>Dear ${name},</p>
            <p>The status of your vehicle <strong>${vehicleNumber}</strong> has been updated.</p>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #2563eb;">Status Information:</h3>
              <p><strong>New Status:</strong> <span style="font-weight: bold; color: ${status === 'approved' ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#ca8a04'};">${status.toUpperCase()}</span></p>
              <p><strong>Vehicle:</strong> ${vehicleNumber}</p>
              <p><strong>Update Date:</strong> ${new Date().toLocaleDateString()}</p>
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            </div>

            ${status === 'approved' ?
              '<p style="color: #16a34a; font-weight: bold;">Your vehicle is now eligible for parking services.</p>' :
              status === 'rejected' ?
              '<p style="color: #dc2626;">Please contact support if you have questions about this decision.</p>' :
              '<p>Your registration is being processed.</p>'
            }

            <br>
            <p>Best regards,<br>VNR Parking Team</p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Status update email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending status update email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User's email
   * @param {string} resetToken - Password reset token
   */
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const transporter = createTransporter();
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'Password Reset Request - VNR Parking',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>You have requested to reset your password for your VNR Parking account.</p>
            <p>Please click the link below to reset your password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>

            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 1 hour for security reasons.</p>

            <br>
            <p>Best regards,<br>VNR Parking Team</p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
