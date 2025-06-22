const nodemailer = require("nodemailer");
require('dotenv').config();
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider
  auth: {
    user: `${process.env.EMAIL}`,
    pass: `${process.env.PASSWORD}`,
  },
});

exports.sendOTP = (email, otp) => {
  transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "VoteEase- Your OTP Code",
    text: `
Dear User,
    
Your OTP code is: ${otp}

Please use this code to complete your authentication. The code will expire in 10 minutes for security reasons. If you did not request this code, please ignore this email.

Best regards,
The VoteEase Team`,
  }, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

exports.notifyVoters = async (req, res) => {
  const { subject, message } = req.body;

  try {
    const voters = await User.find({}, "email");
    const emailList = voters.map(v => v.email); // returns array of emails

    sendElectionNotification(emailList, subject, message);

    res.status(200).json({ message: "Notification emails sent successfully." });
  } catch (error) {
    console.error("Error notifying voters:", error);
    res.status(500).json({ message: "Failed to send notification emails." });
  }
};

sendElectionNotification = (recipients, subject, message) => {
    transporter.sendMail(
      {
        from: process.env.EMAIL,
        to: recipients, // Array or comma-separated string
        subject,
        text: message,
      },
      (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
        } else {
          console.log("Election notification email sent:", info.response);
        }
      }
    );
  };