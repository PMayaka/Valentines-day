const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve static files from project root (one level up from server folder)
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/yes-click', async (req, res) => {
  const to = process.env.EMAIL_TO || 'phillipmayaka@gmail.com';
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(500).json({ error: 'SMTP not configured on server. Set SMTP_HOST, SMTP_USER, SMTP_PASS.' });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const infoBody = `YES button clicked at ${new Date().toString()}\nRequest body: ${JSON.stringify(req.body || {})}`;

  try {
    const info = await transporter.sendMail({
      from: smtpUser,
      to,
      subject: 'Valentine YES clicked',
      text: infoBody,
    });

    console.log('Email sent:', info.messageId);
    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email', details: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
