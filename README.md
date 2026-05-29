# Solid Properties — Astro + Cloudflare Pages

Modern, maintainable rebuild of the Solid Properties & Investments website (Webflow → Astro).

**Live conversion goals achieved:**
- Pixel-perfect modernized design using the original brand colors, typography, and messaging
- Fully native lead forms with Cloudflare Turnstile (no more Tally)
- All Lottie animations preserved
- Clean component architecture ready for long-term ownership
- Ready for Cloudflare Pages deployment

## Tech Stack

- Astro 6 + Tailwind CSS 4
- TypeScript
- lottie-web
- Brevo (for lead email notifications via direct API)
- Cloudflare Pages + Functions + Turnstile

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:4321`

## Environment Variables (required for forms)

Set these in **Cloudflare Pages → Settings → Environment variables** (and locally in a `.env` file for development):

| Variable                | Description                                                                 | Example                                           |
|-------------------------|---------------------------------------------------------------------------------|---------------------------------------------------|
| `BREVO_API_KEY`         | Your Brevo v3 API key (get it from Brevo → SMTP & API)                          | `xkeysib-xxx...`                                  |
| `LEAD_EMAIL_TO`         | Where new leads should be delivered to                                          | `you@yourdomain.com`                              |
| `FROM_EMAIL`            | **Must be a verified sender in your Brevo account**                             | `Solid Properties <hello@yourdomain.com>`         |
| `TURNSTILE_SECRET_KEY`  | Cloudflare Turnstile secret key (for spam protection)                           | `0x4AAAAA...`                                     |

**Important:** In Brevo, go to **Senders & IP** → **Senders** and verify the email address or domain you want to use in `FROM_EMAIL`. Brevo's free plan is usually much more flexible than Resend's for adding senders.

**Important:** Create a free [Resend](https://resend.com) account and add your sending domain. Also create a Turnstile widget at dash.cloudflare.com → Turnstile.

## Deployment (Cloudflare Pages)

1. Push this repo to GitHub
2. In Cloudflare Dashboard → Pages → Create new project → Connect GitHub
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add the environment variables above
5. Deploy

The `@astrojs/cloudflare` adapter is already configured.

## Project Structure

```
src/
├── components/
│   ├── LeadForm.astro      # Core conversion form + Turnstile
│   ├── Lottie.astro        # Reusable Lottie player
│   ├── Navbar.astro
│   └── Footer.astro
├── layouts/
│   └── Layout.astro        # Base layout with fonts, meta, Fathom
├── pages/
│   ├── index.astro
│   ├── contact.astro
│   ├── joint-venture.astro
│   ├── privacy-security-policy.astro
│   ├── terms-of-service.astro
│   ├── accessibility.astro
│   └── api/lead.ts         # Form handler (Cloudflare Function)
├── styles/
│   └── global.css          # Design tokens + utilities
public/
├── images/                 # All original Webflow assets
└── lottie/                 # 5 original Lottie JSON files
webflow-export/             # Original export (reference only)
```

## Next Steps / Polish Items

- Replace the placeholder Turnstile site key in `LeadForm.astro` with your real Cloudflare Turnstile key
- Add your real `BREVO_API_KEY`, `LEAD_EMAIL_TO`, and `FROM_EMAIL` in Cloudflare Pages environment variables
- In Brevo, verify your sender email/domain under **Senders & IP → Senders**
- Consider adding more testimonials or case studies
- Optional: Add a blog later with Astro Content Collections

---

Built from the original Webflow export. All content and branding preserved. Ready for production.
