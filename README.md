# Birendra Mishra CMS backend

Strapi 5.60.0 backend for the existing static website. The schemas are code based and version controlled. The existing HTML pages remain usable as the copy fallback; the first Strapi start seeds a matching homepage plus privacy, terms, booking, booking management and 404 page records. Bootstrap only seeds missing records, so editorial changes are not overwritten on later restarts.

## Requirements and local start

- Node.js 22, 24 or 26 LTS and npm.
- Create a private `.env` from `.env.example`. Generate distinct cryptographically random values for `APP_KEYS` (four comma separated values) and each secret. Never commit `.env` or place admin/API secrets in browser JavaScript.
- `npm install`
- `npm run develop`
- Complete the first admin registration at `http://localhost:1337/admin`.

For local static site preview, run the parent folder on port 8000. Set `FRONTEND_URL` and `CORS_ORIGINS` to the exact browser origin(s). In production use HTTPS and the exact website origin; do not use `*`. Configure `PUBLIC_URL` to the externally reachable HTTPS Strapi URL.

## Content model

- **Homepage** single type: fixed `hero`, `pillars`, `about`, `expertise`, `services`, `philosophy`, `pricing`, `approach`, `insights`, `faq`, and `contact` component fields, plus shared header/footer navigation and SEO metadata.
- **Legal and site pages** collection type: privacy, terms, booking, manage booking and 404 records with fixed `about`, `contact`, `faq`, and `pricing` component fields and SEO metadata.
- **Section components:** hero, pillars, about, expertise, services, philosophy, pricing, approach, insights, FAQ and contact. Each has editable headings, copy and ordered repeatable content items.
- **SEO metadata component:** title and description length constraints, canonical URL, robots noindex, Open Graph/Twitter fields, image URL and JSON-LD data.

### Editing homepage content

Open **Content Manager → Homepage**. Each page section has its own named component field. Edit the matching section, then publish the Homepage entry. The website reads the published record on each request, so a page refresh should show the change immediately.

- **Eyebrow** is the small label above a section heading; **Heading** is its title; **Description** is the short copy; **Body** is longer formatted copy.
- **Items** are ordered repeatable rows. For most sections use **Title** and **Description** for each card, highlight, FAQ question/answer, or contact detail.
- In **About**, the first three items are the left-side highlight cards. The item titled **Engagement** fills the right-side introduction. Remaining items fill its benefit rows.
- In **Pricing**, each item is a consultation. Set its consultation ID, title, duration, fee or fee label, summary, bookable flag, and optional payment link. The section description is the short introduction and the disclaimer field is the fee note.
- In **Contact**, use the item titles `Direct email`, `Confidentiality`, `Response time`, `Form`, and the placeholder names shown in Content Manager to update the matching details and form prompts.
- **SEO** fields are edited on the Homepage entry. Page-specific SEO fields are on each Legal and site page record.

The field-level fallback content is defined in `src/seed/fallback.ts`, organized under the same named section fields and item fields. Bootstrap creates missing content only; it never overwrites a published edit. On first startup after the fixed-field schema change, it migrates the existing section links without changing their component data. The copied HTML templates remain a display fallback if the CMS cannot be reached.

The fallback is based on the current `index.html`, `book.html`, `manage.html`, `privacy.html`, `terms.html` and `404.html` copy. Existing booking and enquiry operations remain on the documented Apps Script backend; no private booking data is exposed through these CMS content types.

## Read access and API

Strapi content types are private by default. After creating the first admin, open **Settings → Users & Permissions → Roles → Public** and enable only `find` and (for pages) `findOne` on Homepage and Legal and site pages. Leave create, update and delete disabled. This allows public read-only CMS content while keeping editorial writes authenticated. Never enable public writes or put a privileged Content API token in static-site JavaScript.

- Homepage: `GET /api/homepage?populate[sections][populate][items]=*&populate[seo]=*`
- Pages: `GET /api/pages?filters[slug][$eq]=privacy&populate[sections][populate][items]=*&populate[seo]=*`
- Published pages only are public. The `manage` and `404` SEO records use `noIndex: true`.

When mapping API results into HTML, write text with `textContent` (not `innerHTML`). Treat JSON-LD as structured data and serialize it with `JSON.stringify`; do not interpolate untrusted strings into executable markup.

## Production database and deployment

SQLite is only the local default. For production set `DATABASE_CLIENT=postgres`, provide `DATABASE_URL` or the `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME` and `DATABASE_PASSWORD` values, and configure TLS with `DATABASE_SSL=true`. Persist the upload directory and database backups. Deploy this folder to a Node hosting service; static-only hosting such as the current Hostinger site cannot run Strapi. Set the public CORS allowlist and `PUBLIC_URL` before launch, use HTTPS, restrict admin accounts, and back up the database before schema changes.

The default Strapi security middleware is retained. CORS is origin allowlisted with credentials disabled, SVG uploads are denied, and uploaded files are restricted to common raster image types. Content API remains private unless the administrator grants the read-only Public role permissions above. Production secrets must be unique and managed by the host's secret store.
