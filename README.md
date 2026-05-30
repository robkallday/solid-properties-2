# Solid Properties — Astro + Cloudflare Pages

Modern, maintainable rebuild of the Solid Properties & Investments website (Webflow → Astro).

**Live conversion goals achieved:**
- Pixel-perfect modernized design using the original brand colors, typography, and messaging
- Lead forms powered by Web3Forms (with built-in spam protection)
- All Lottie animations preserved
- Clean component architecture ready for long-term ownership
- Ready for Cloudflare Pages deployment

## Tech Stack

- Astro 6 + Tailwind CSS 4
- TypeScript
- lottie-web
- Web3Forms (for form submissions)
- Cloudflare Pages

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:4321`

## Environment Variables (required for forms)

Set these in **Cloudflare Pages → Settings → Environment variables** (and locally in a `.env` file for development):

| Variable                        | Description                                      | Example                  |
|---------------------------------|--------------------------------------------------|--------------------------|
| `PUBLIC_WEB3FORMS_ACCESS_KEY`   | Your Web3Forms Access Key                        | `abc123...`              |

**Note:** Web3Forms handles spam protection and email delivery.

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
│   ├── LeadForm.astro      # Core conversion form (Web3Forms)
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
│   └── (forms now submit directly to Web3Forms)
├── styles/
│   └── global.css          # Design tokens + utilities
public/
├── images/                 # All original Webflow assets
└── lottie/                 # 5 original Lottie JSON files
webflow-export/             # Original export (reference only)
```

## Next Steps / Polish Items

- Add your `PUBLIC_WEB3FORMS_ACCESS_KEY` in Cloudflare Pages environment variables
- Consider adding more testimonials or case studies
- Optional: Add a blog later with Astro Content Collections

---

Built from the original Webflow export. All content and branding preserved. Ready for production.
