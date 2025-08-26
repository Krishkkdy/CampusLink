import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Add error handling and verification
transporter.verify(function(error, success) {
  if (error) {
    console.log('SMTP Error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

export const sendWelcomeEmail = async (email, password, role) => {
  const mailOptions = {
    from: `"Alumni-Connect" <${process.env.EMAIL_USER}>`,  // Updated sender
    to: email,
    subject: 'Welcome to Alumni-Connect',
    html: `
      <h1>Welcome to CampusLink!</h1>
      <p>Your account has been created as a ${role}.</p>
      <p>Your login credentials:</p>
      <p>Email: ${email}</p>
      <p>Password: ${password}</p>
      <p>Please change your password after first login.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendResetPasswordEmail = async (email, resetUrl) => {
  console.log("Sending reset email with URL:", resetUrl);
  
  const mailOptions = {
    from: `"Alumni-Connect" <${process.env.EMAIL_USER}>`,  // Updated sender
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent successfully to', email);
    return true;
  } catch (error) {
    console.error('Error sending reset password email:', error);
    return false;
  }
};

export const sendGenericEmail = async (email, subject, message) => {
  const mailOptions = {
    from: `"CampusLink" <${process.env.EMAIL_USER}>`,  // Updated sender
    to: email,
    subject: subject,
    html: message
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};


