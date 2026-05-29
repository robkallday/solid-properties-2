/**
 * Cloudflare Pages Function for handling lead form submissions.
 * This replaces the old src/pages/api/lead.ts
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { address, email, phone, turnstileToken, source, page } = body;

    // Basic validation
    if (!address || !email) {
      return new Response(JSON.stringify({ message: 'Address and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify Cloudflare Turnstile
    const secretKey = env.TURNSTILE_SECRET_KEY || '0x4AAAAAAAQTptj2So4dx43e';

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
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Get Brevo configuration from environment variables
    const brevoApiKey = env.BREVO_API_KEY;
    const toEmail = env.LEAD_EMAIL_TO;
    const fromEmail = env.FROM_EMAIL;

    if (!brevoApiKey || !toEmail || !fromEmail) {
      console.log('=== NEW LEAD (Brevo not fully configured in Pages env) ===');
      console.log({ address, email, phone, source, page });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse FROM_EMAIL
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

    // Send via Brevo REST API
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
      return new Response(JSON.stringify({ message: 'Failed to send notification' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Lead form error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
