import express from 'express';
import { Client } from 'pg';
import nodemailer from 'nodemailer';

const router = express.Router();

// PostgreSQL client setup
const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Inventory',
  password: 'rushikeshwayal@007',
  port: 5432,
});

db.connect();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rushikeshwayal6@gmail.com', // Replace with your email
    pass: 'rushikeshwayal@007',  // Replace with your email password
  },
});

const sendAlertEmail = (to, item) => {
  const mailOptions = {
    from: 'rushikeshwayal6@gmail.com', // Replace with your email
    to,
    subject: `Alert: ${item.item_name} is expiring soon`,
    text: `The item ${item.item_name} is expiring on ${new Date(item.expiry_date).toLocaleDateString()}. Please take necessary action.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Route to send alerts to a specific email
router.get('/send-alerts', async (req, res) => {
  const specificEmail = 'raghunathbhusare1211@gmail.com'; // Replace with the specific email address

  try {
    const healthcareResult = await db.query(`
      SELECT * FROM healthcare
      WHERE expiry_date <= NOW() + INTERVAL '8 days'
    `);

    const expiringItems = healthcareResult.rows;

    expiringItems.forEach(item => {
      sendAlertEmail(specificEmail, item);
    });

    res.status(200).json({ message: 'Alerts sent successfully' });
  } catch (error) {
    console.error('Error sending alerts:', error);
    res.status(500).json({ message: 'Failed to send alerts' });
  }
});

export default router;
