import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});


  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
