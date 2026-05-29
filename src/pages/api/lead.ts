import type { APIRoute } from 'astro';

// Force this route to be rendered on-demand (Cloudflare Pages Function)
export const prerender = false;

// ============================================
// Brevo (Sendinblue) Lead Notification Handler
// ============================================
// Uses direct fetch to Brevo's REST API (lightweight + Cloudflare compatible)
//
// Required environment variables (set in Cloudflare Pages):
//   BREVO_API_KEY          → Your Brevo v3 API key
//   LEAD_EMAIL_TO          → Where you want to receive leads (your inbox)
//   FROM_EMAIL             → Must be a verified sender in your Brevo account
//                              Example: "Solid Properties <hello@yourdomain.com>"
//   TURNSTILE_SECRET_KEY   → Optional but recommended

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { address, email, phone, turnstileToken, source, page } = body;

    // Basic validation
    if (!address || !email) {
      return new Response(JSON.stringify({ message: 'Address and email are required' }), {
        status: 400,
      });
    }

    // Verify Cloudflare Turnstile
    const secretKey =
      import.meta.env.TURNSTILE_SECRET_KEY ||
      process.env.TURNSTILE_SECRET_KEY ||
      '0x4AAAAAAAQTptj2So4dx43e';

    if (secretKey && turnstileToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretKey,
          response: turnstileToken,
          remoteip: request.headers.get('cf-connecting-ip') || '',
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        console.warn('Turnstile verification failed', verifyData);
        return new Response(JSON.stringify({ message: 'Security check failed' }), {
          status: 403,
        });
      }
    }

    // Get configuration
    const brevoApiKey = import.meta.env.BREVO_API_KEY || process.env.BREVO_API_KEY;
    const toEmail = import.meta.env.LEAD_EMAIL_TO || process.env.LEAD_EMAIL_TO;
    const fromEmail = import.meta.env.FROM_EMAIL || process.env.FROM_EMAIL;

    if (!brevoApiKey || !toEmail || !fromEmail) {
      // Development / fallback mode
      console.log('=== NEW LEAD (Brevo not fully configured) ===');
      console.log({ address, email, phone, source, page });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Parse FROM_EMAIL into name + email
    const fromMatch = fromEmail.match(/^(?:"?([^"<]+)"?\s*)?<([^>]+)>$|(.+)/);
    let senderName = 'Solid Properties';
    let senderEmail = fromEmail;

    if (fromMatch) {
      if (fromMatch[1] && fromMatch[2]) {
        senderName = fromMatch[1].trim();
        senderEmail = fromMatch[2].trim();
      } else if (fromMatch[3]) {
        senderEmail = fromMatch[3].trim();
      }
    }

    // Send via Brevo REST API (lightweight, no heavy SDK)
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail }],
        replyTo: { email, name: email },
        subject: `New Cash Offer Lead: ${address}`,
        htmlContent: `
          <h2 style="font-family: system-ui, sans-serif; color: #1c2657;">New Lead from Solid Properties Website</h2>
          
          <p style="font-size: 15px; line-height: 1.5;">
            <strong>Property Address:</strong> ${address}<br>
            <strong>Email:</strong> <a href="mailto:${email}">${email}</a><br>
            <strong>Phone:</strong> ${phone ? `<a href="tel:${phone}">${phone}</a>` : 'Not provided'}<br>
            <strong>Source:</strong> ${source || 'website'}<br>
            <strong>Page:</strong> ${page || '/'}
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Submitted via Astro + Cloudflare Pages + Brevo</p>
        `,
      }),
    });

    if (!brevoRes.ok) {
      const errorText = await brevoRes.text();
      console.error('Brevo API error:', brevoRes.status, errorText);
      throw new Error(`Brevo API responded with ${brevoRes.status}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Lead form error (Brevo):', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  }
};
