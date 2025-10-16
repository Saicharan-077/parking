// Import nodemailer library for sending emails
const nodemailer = require('nodemailer');

// Create and configure email transporter for SMTP communication
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com', // SMTP server hostname
    port: process.env.EMAIL_PORT || 587, // SMTP port (587 for TLS)
    secure: false, // Use TLS encryption
    auth: {
      user: process.env.EMAIL_USER, // SMTP username
      pass: process.env.EMAIL_PASS // SMTP password
    }
  });
};

// Predefined HTML email templates for different scenarios
const emailTemplates = {
  // Template for vehicle registration confirmation email
  vehicleRegistration: (data) => ({
    subject: 'Vehicle Registration Confirmation - VNR Parking Pilot',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">VNR Parking Pilot</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">VNR VJIET Vehicle Management System</p>
        </div>

        <div style="padding: 30px; background: #f8fafc; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Vehicle Registration Confirmed!</h2>

          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #374151; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Vehicle Details</h3>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 40%;">Vehicle Number:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.vehicle_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Vehicle Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.vehicle_type.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Model:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.model || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Color:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.color || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">EV Vehicle:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.is_ev ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Owner Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.owner_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Student/Employee ID:</td>
                <td style="padding: 8px 0; color: #1f2937;">${data.employee_student_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Registration Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">Important Information</h4>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li>Keep this email as your registration confirmation</li>
              <li>You can view and manage your vehicles at any time</li>
              <li>For support, contact our help desk</li>
              <li>Follow campus parking regulations</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:8080/my-vehicles"
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View My Vehicles
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>This is an automated message from VNR Parking Pilot. Please do not reply to this email.</p>
          <p>&copy; 2024 VNR VJIET. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  // Template for welcome email to new users
  welcome: (username) => ({
    subject: 'Welcome to VNR Parking Pilot!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to VNR Parking Pilot!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Vehicle Management System</p>
        </div>

        <div style="padding: 30px; background: #f8fafc; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Hello ${username}!</h2>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for joining VNR Parking Pilot! We're excited to help you manage your vehicle registration
            at VNR VJIET campus.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
            <h3 style="color: #1e40af; margin-bottom: 15px;">What you can do:</h3>
            <ul style="color: #374151; padding-left: 20px;">
              <li>Register your vehicles easily</li>
              <li>Search and find vehicle information</li>
              <li>Manage your vehicle details</li>
              <li>Get instant support when needed</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:8080/register"
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
              Register Vehicle
            </a>
            <a href="http://localhost:8080/help"
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Get Help
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>&copy; 2024 VNR VJIET. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Function to send emails using configured transporter
const sendEmail = async (to, template, data) => {
  try {
    // In development mode or without email credentials, log instead of sending
    if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER) {
      console.log('📧 Email would be sent:', {
        to,
        subject: template.subject,
        data
      });
      return { success: true, message: 'Email logged (development mode)' };
    }

    // Create email transporter instance
    const transporter = createTransporter();

    // Configure email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // Sender address
      to, // Recipient address
      ...template(data) // Spread template subject and HTML content
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Export email service functions and templates
module.exports = {
  sendEmail,
  emailTemplates
};
