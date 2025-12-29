// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage (replace with a database in production)
const users = [
  {
    id: 1,
    email: 'manager@mochkris.com',
    password: 'manager123',
    name: 'Manager User',
    role: 'manager',
    resetToken: null,
    resetTokenExpires: null
  },
  {
    id: 2,
    email: 'owner@mochkris.com',
    password: 'owner123',
    name: 'Owner User',
    role: 'owner',
    resetToken: null,
    resetTokenExpires: null
  }
];

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate token and set expiration (1 hour)
  const token = uuidv4();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);

  // Store token (in production, update in database)
  user.resetToken = token;
  user.resetTokenExpires = expires;

  // Send email
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset for your MochKris Inventory account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }
    res.json({ message: 'Password reset email sent' });
  });
});

// Reset password endpoint
app.post('/api/auth/reset-password', (req, res) => {
  const { token, password } = req.body;
  
  const user = users.find(u => 
    u.resetToken === token && 
    new Date(u.resetTokenExpires) > new Date()
  );

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Update password and clear reset token
  user.password = password;
  user.resetToken = null;
  user.resetTokenExpires = null;

  // In a real app, you would hash the password before saving
  // user.password = await bcrypt.hash(password, 10);

  res.json({ message: 'Password updated successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});