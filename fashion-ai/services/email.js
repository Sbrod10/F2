const { Resend } = require('resend');

const hasEmailConfig = !!process.env.RESEND_API_KEY;
const resend = hasEmailConfig ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendWelcomeEmail(to, name) {
  if (!resend) return;
  await resend.emails.send({
    from: 'StyleAI <onboarding@resend.dev>',
    to,
    subject: 'Welcome to StyleAI! 👗',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#080810;color:#f1f5f9;padding:40px;border-radius:16px;">
        <h1 style="color:#3b82f6;margin-bottom:8px;">Welcome to StyleAI, ${name}!</h1>
        <p style="color:#94a3b8;font-size:16px;line-height:1.6;">
          Your account is ready. Start discovering outfits tailored to your style, scan your environment for outfit ideas, and compare prices across 12+ retailers.
        </p>
        <a href="http://localhost:3000/discover.html"
           style="display:inline-block;margin-top:24px;padding:14px 28px;background:linear-gradient(135deg,#3b82f6,#ec4899);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:16px;">
          Start Discovering
        </a>
        <p style="color:#475569;font-size:13px;margin-top:32px;">StyleAI · AI-Powered Fashion Discovery</p>
      </div>
    `
  });
}

async function sendPasswordResetEmail(to, name, resetLink) {
  if (!resend) return;
  await resend.emails.send({
    from: 'StyleAI <onboarding@resend.dev>',
    to,
    subject: 'Reset your StyleAI password',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#080810;color:#f1f5f9;padding:40px;border-radius:16px;">
        <h1 style="color:#3b82f6;margin-bottom:8px;">Password Reset</h1>
        <p style="color:#94a3b8;font-size:16px;line-height:1.6;">
          Hi ${name}, you requested a password reset for your StyleAI account.
        </p>
        <a href="${resetLink}"
           style="display:inline-block;margin-top:24px;padding:14px 28px;background:linear-gradient(135deg,#3b82f6,#ec4899);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:16px;">
          Reset Password
        </a>
        <p style="color:#475569;font-size:13px;margin-top:32px;">If you didn't request this, ignore this email.</p>
      </div>
    `
  });
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, hasEmailConfig };
