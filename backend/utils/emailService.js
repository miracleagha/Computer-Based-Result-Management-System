/**
 * emailService.js — powered by Brevo (formerly Sendinblue) REST API.
 * Uses Node 18+ built-in fetch — no extra package needed.
 *
 * Required .env vars:
 *   BREVO_API_KEY      — xkeysib-... key from app.brevo.com/settings/keys/api
 *   BREVO_FROM_EMAIL   — verified sender address in your Brevo account
 *   BREVO_FROM_NAME    — display name (optional, defaults to "Student Result Manager")
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Low-level send via Brevo Transactional Email API.
 * Falls back to console log when BREVO_API_KEY is not configured.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.log('📧 [NO BREVO KEY] Email would be sent:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Preview: ${(text || html)?.substring(0, 150)}…`);
    return { messageId: 'noop-' + Date.now() };
  }

  const recipients = (Array.isArray(to) ? to : [to]).map((email) =>
    typeof email === 'string' ? { email } : email
  );

  const body = {
    sender: {
      name: process.env.BREVO_FROM_NAME || 'Student Result Manager',
      email: process.env.BREVO_FROM_EMAIL,
    },
    to: recipients,
    subject,
    ...(html ? { htmlContent: html } : { textContent: text }),
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Brevo API error ${response.status}:`, errorBody);
      return { messageId: 'error-' + Date.now(), error: errorBody };
    }

    const data = await response.json();
    console.log(`✅ Email sent via Brevo to ${Array.isArray(to) ? to.join(', ') : to} — messageId: ${data.messageId}`);
    return data;
  } catch (err) {
    console.error('❌ Brevo request failed:', err.message);
    return { messageId: 'error-fallback-' + Date.now(), error: err.message };
  }
};

/**
 * Send account creation email with generated credentials.
 */
export const sendAccountCreationEmail = async (user, password) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${user.role === 'student' ? 'student-login' : 'login'}`;
  const subject = 'Your Account Has Been Created — Student Result Management System';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e40af, #059669); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🎓 Student Result Manager</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Academic Excellence Platform</p>
      </div>
      <div style="padding: 32px 24px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">Welcome, ${user.firstName}!</h2>
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
          Your <strong style="text-transform: capitalize;">${user.role}</strong> account has been created on the Student Result Management System.
          Use the credentials below to log in:
        </p>
        <div style="background: white; padding: 24px; border-radius: 10px; border: 1px solid #e5e7eb; margin: 0 0 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 110px;">Email</td>
              <td style="padding: 10px 0; color: #1f2937; font-weight: 600; font-size: 14px;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Password</td>
              <td style="padding: 10px 0; color: #1f2937; font-weight: 700; font-size: 15px; font-family: 'Courier New', monospace; letter-spacing: 0.05em;">${password}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Role</td>
              <td style="padding: 10px 0; color: #1f2937; font-weight: 600; font-size: 14px; text-transform: capitalize;">${user.role}</td>
            </tr>
          </table>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
          <p style="color: #dc2626; margin: 0; font-size: 14px; font-weight: 600;">
            ⚠️ Security: Please change your password immediately after your first login.
          </p>
        </div>
        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #059669); color: white; text-decoration: none; padding: 13px 36px; border-radius: 8px; font-weight: 700; font-size: 15px;">
          Login Now →
        </a>
      </div>
      <div style="padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Student Result Management System. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send result publication notification to a student.
 */
export const sendResultPublishedEmail = async (user, semester, session) => {
  const resultsUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/results`;
  const subject = `Results Published — ${semester} ${session}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e40af, #059669); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🎓 Student Result Manager</h1>
      </div>
      <div style="padding: 32px 24px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">Results Published 📊</h2>
        <p style="color: #4b5563; line-height: 1.6;">Dear ${user.firstName},</p>
        <p style="color: #4b5563; line-height: 1.6;">
          Your results for <strong>${semester} — ${session}</strong> have been approved and are now available for viewing.
        </p>
        <a href="${resultsUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #059669); color: white; text-decoration: none; padding: 13px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; margin-top: 20px;">
          View My Results →
        </a>
      </div>
      <div style="padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Student Result Management System</p>
      </div>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html });
};

/**
 * Send password reset link.
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request — Student Result Management System';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e40af, #059669); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🎓 Student Result Manager</h1>
      </div>
      <div style="padding: 32px 24px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">Password Reset Request 🔐</h2>
        <p style="color: #4b5563; line-height: 1.6;">Dear ${user.firstName},</p>
        <p style="color: #4b5563; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new password.
          <strong>This link expires in 15 minutes.</strong>
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #059669); color: white; text-decoration: none; padding: 13px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 20px 0 16px;">
          Reset My Password →
        </a>
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          If you didn't request a password reset, you can safely ignore this email. Your account is secure.
        </p>
      </div>
      <div style="padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Student Result Management System</p>
      </div>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html });
};
