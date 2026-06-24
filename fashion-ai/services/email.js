const https = require('https');

const hasEmailConfig = !!process.env.RESEND_API_KEY;

function sendRequest(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendWelcomeEmail(to, name) {
  if (!hasEmailConfig) return;
  const result = await sendRequest({
    from: 'StyleComplex <onboarding@resend.dev>',
    to: [to],
    subject: 'Welcome to StyleComplex! 👗',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#080810;color:#f1f5f9;padding:40px;border-radius:16px;">
        <h1 style="color:#3b82f6;margin-bottom:8px;">Welcome to StyleComplex, ${name}!</h1>
        <p style="color:#94a3b8;font-size:16px;line-height:1.6;">
          Your account is ready. Start discovering outfits tailored to your style, scan your environment for outfit ideas, and compare prices across 12+ retailers.
        </p>
        <a href="http://localhost:3000/discover.html"
           style="display:inline-block;margin-top:24px;padding:14px 28px;background:linear-gradient(135deg,#3b82f6,#ec4899);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:16px;">
          Start Discovering
        </a>
        <p style="color:#475569;font-size:13px;margin-top:32px;">StyleComplex · AI-Powered Fashion Discovery</p>
      </div>
    `
  });
  console.log('Email sent:', result.status, result.body);
}

module.exports = { sendWelcomeEmail, hasEmailConfig };
