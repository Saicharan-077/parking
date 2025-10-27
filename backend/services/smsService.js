// Import Twilio SDK for SMS functionality
const twilio = require('twilio');

// Twilio configuration from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are provided
let client = null;
if (accountSid && authToken && accountSid.startsWith('AC')) {
  client = twilio(accountSid, authToken);
}

// Predefined SMS templates for different scenarios
const smsTemplates = {
  // Template for phone number verification OTP
  phoneVerification: (otp) => ({
    body: `VNR Parking Pilot: Your verification code is ${otp}. This code will expire in 10 minutes.`
  }),

  // Template for email verification OTP
  emailVerification: (otp) => ({
    body: `VNR Parking Pilot: Your email verification code is ${otp}. This code will expire in 10 minutes.`
  }),

  // Template for vehicle registration confirmation
  vehicleRegistration: (vehicleNumber) => ({
    body: `VNR Parking Pilot: Your vehicle ${vehicleNumber} has been successfully registered. Welcome to VNR VJIET parking system!`
  }),

  // Template for general notifications
  generalNotification: (message) => ({
    body: `VNR Parking Pilot: ${message}`
  })
};

// Function to send SMS using Twilio
const sendSMS = async (to, template, data) => {
  try {
    // Check if Twilio is configured (for development/production)
    if (!client || !fromPhoneNumber) {
      console.log('📱 SMS would be sent (development mode):', {
        to,
        body: template(data).body
      });
      return { success: true, message: 'SMS logged (development mode)' };
    }

    // Send SMS via Twilio
    const message = await client.messages.create({
      body: template(data).body,
      from: fromPhoneNumber,
      to: to
    });

    console.log('📱 SMS sent:', message.sid);
    return { success: true, messageId: message.sid };

  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send phone verification OTP
const sendPhoneVerificationOTP = async (phoneNumber) => {
  const otp = generateOTP();
  const result = await sendSMS(phoneNumber, smsTemplates.phoneVerification, otp);
  return { ...result, otp };
};

// Function to send email verification OTP (via SMS to phone)
const sendEmailVerificationOTP = async (phoneNumber) => {
  const otp = generateOTP();
  const result = await sendSMS(phoneNumber, smsTemplates.emailVerification, otp);
  return { ...result, otp };
};

// Function to send vehicle registration confirmation SMS
const sendVehicleRegistrationSMS = async (phoneNumber, vehicleNumber) => {
  return await sendSMS(phoneNumber, smsTemplates.vehicleRegistration, vehicleNumber);
};

// Export SMS service functions and templates
module.exports = {
  sendSMS,
  sendPhoneVerificationOTP,
  sendEmailVerificationOTP,
  sendVehicleRegistrationSMS,
  smsTemplates,
  generateOTP
};
