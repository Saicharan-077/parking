// Import required services
const { sendEmail, emailTemplates } = require('./emailService');
const { sendPhoneVerificationOTP, sendEmailVerificationOTP } = require('./smsService');

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// OTP expiration time (10 minutes)
const OTP_EXPIRY = 10 * 60 * 1000;

// Function to generate and send email verification OTP
const sendEmailVerification = async (email, phoneNumber) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `email_${email}`;
    const expiry = Date.now() + OTP_EXPIRY;

    // Store OTP with expiry
    otpStore.set(key, { otp, expiry, type: 'email' });

    // Send OTP via SMS to phone number
    const smsResult = await sendEmailVerificationOTP(phoneNumber);

    // Also send email notification
    const emailData = {
      otp,
      email,
      phoneNumber
    };

    const emailResult = await sendEmail(email, {
      subject: 'VNR Parking Pilot - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">VNR Parking Pilot</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>

          <div style="padding: 30px; background: #f8fafc; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #1e40af; margin-bottom: 20px;">Verify Your Email</h2>

            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                Your verification code is:
              </p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; color: #1e40af; letter-spacing: 2px;">
                ${otp}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
                This code will expire in 10 minutes.
              </p>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0;">Important Information</h4>
              <ul style="margin: 0; padding-left: 20px; color: #374151;">
                <li>Enter this code in the verification field</li>
                <li>The code is valid for 10 minutes only</li>
                <li>Do not share this code with anyone</li>
              </ul>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>&copy; 2024 VNR VJIET. All rights reserved.</p>
          </div>
        </div>
      `
    }, emailData);

    return {
      success: smsResult.success && emailResult.success,
      message: 'Verification code sent to your phone and email'
    };

  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: error.message };
  }
};

// Function to generate and send phone verification OTP
const sendPhoneVerification = async (phoneNumber) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `phone_${phoneNumber}`;
    const expiry = Date.now() + OTP_EXPIRY;

    // Store OTP with expiry
    otpStore.set(key, { otp, expiry, type: 'phone' });

    // Send OTP via SMS
    const result = await sendPhoneVerificationOTP(phoneNumber);

    return {
      success: result.success,
      message: 'Verification code sent to your phone'
    };

  } catch (error) {
    console.error('Phone verification error:', error);
    return { success: false, error: error.message };
  }
};

// Function to verify OTP
const verifyOTP = (identifier, otp, type) => {
  const key = `${type}_${identifier}`;
  const storedData = otpStore.get(key);

  if (!storedData) {
    return { success: false, error: 'No verification code found' };
  }

  if (Date.now() > storedData.expiry) {
    otpStore.delete(key);
    return { success: false, error: 'Verification code expired' };
  }

  if (storedData.otp !== otp) {
    return { success: false, error: 'Invalid verification code' };
  }

  // Remove used OTP
  otpStore.delete(key);

  return { success: true, message: 'Verification successful' };
};

// Function to verify email OTP
const verifyEmailOTP = (email, otp) => {
  return verifyOTP(email, otp, 'email');
};

// Function to verify phone OTP
const verifyPhoneOTP = (phoneNumber, otp) => {
  return verifyOTP(phoneNumber, otp, 'phone');
};

// Function to clean up expired OTPs (call this periodically)
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiry) {
      otpStore.delete(key);
    }
  }
};

// Set up periodic cleanup (every 5 minutes)
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

// Export verification service functions
module.exports = {
  sendEmailVerification,
  sendPhoneVerification,
  verifyEmailOTP,
  verifyPhoneOTP,
  cleanupExpiredOTPs
};
