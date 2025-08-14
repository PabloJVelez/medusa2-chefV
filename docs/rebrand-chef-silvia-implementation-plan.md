## Rebrand Implementation Plan — Chef Silvia

### Overview
Rebrand the entire site from “Chef Velez” to “Chef Silvia”. This includes storefront copy, SEO/meta tags, images/alt text, and backend email templates. Add a small brand configuration to centralize values and a CI guard to prevent regressions by failing if “Velez” remains in the codebase.

### Goals
- Replace visible brand mentions and SEO with “Chef Silvia”.
- Wire Instagram to the provided profile: [`silcooksforyou`](https://www.instagram.com/silcooksforyou/).
- Swap the “Meet Chef Luis” section with Chef Silvia’s bio and portrait.
- Centralize brand name and contacts for future updates.
- Add CI check to fail when the string “Velez” is present after the refactor.

### Inputs (confirmed)
- Brand name: Chef Silvia
- Instagram: `https://www.instagram.com/silcooksforyou/`
- Support email/domain: leave as-is for now
- Portrait/Hero image: provided (replace the image in the “Meet Chef” section)
- Bio to reuse:
  - Title: “Meet Chef Silvia” — “A Culinary Journey”
  - Copy:
    A visionary Executive Chef, whose culinary roots are deeply embedded in the vibrant essence of Los Angeles. Born of Cuban descent, she has artfully blended her rich heritage with the precision and elegance of classical French training. Boasting over 18 years of experience, she has been a dynamic force within the eclectic Los Angeles food scene, constantly pushing the boundaries of culinary innovation. Now, having returned to Miami, she focuses her talents on highlighting the splendor of local ingredients. Her approach to cuisine is transformative, creating dishes that are not merely consumed but experienced. Each menu she designs is a bespoke journey, tailored to enchant the senses and leave an indelible mark on all who have the pleasure of tasting her creations.

---

## Scope of Work

### A. Storefront (`apps/storefront`)

#### 1) Centralize site identity
- File: `libs/util/server/root.server.ts`
  - Edit `siteDetails.store.name` from `Chef Velez` to `Chef Silvia`.
- File: `libs/config/site/site-settings.ts`
  - Update `description` to use Chef Silvia.
  - Set `social_instagram` to `https://www.instagram.com/silcooksforyou/`.
  - Keep other socials blank for now.

#### 2) Navigation and labeling
- File: `libs/config/site/navigation-items.ts`
  - Footer label: change `About Chef Velez` → `About Chef Silvia`.

#### 3) Root meta defaults
- File: `app/root.tsx`
  - In `getRootMeta`, set `title` to `Chef Silvia`.
  - Keep baseline description, or align with updated `siteSettings.description`.

#### 4) Home page: Meet Chef section and SEO
- File: `app/routes/_index.tsx`
  - Update page meta titles/descriptions (replace “Chef Luis Velez” → “Chef Silvia”).
  - Replace the “Meet Chef Luis” section with:
    - Heading: “Meet Chef Silvia”
    - Subheading: “A Culinary Journey”
    - Body copy: use the bio text above (split into 1–2 paragraphs as needed).
    - Image: point to the new asset (see Assets section). Update alt to “Chef Silvia in her kitchen”.
  - Update any remaining CTA alt text mentioning “Chef Velez” to “Chef Silvia”.

#### 5) Other route pages with brand mentions
- Files to update brand mentions and SEO:
  - `app/routes/how-it-works.tsx` — meta title/og to “Chef Silvia”.
  - `app/routes/request._index.tsx` — meta title/og to “Chef Silvia”.
  - `app/routes/request.success.tsx` — meta title/og to “Chef Silvia” (support email can remain unchanged for now).
  - `app/routes/menus._index.tsx` — meta title/description/keywords to “Chef Silvia”.
  - `app/routes/menus.$menuId.tsx` — meta title/keywords and `name` fields to “Chef Silvia”.
  - `app/routes/about.tsx` and `app/routes/about-us.tsx` — replace copy blocks with Chef Silvia where applicable (reuse the bio).

#### 6) Components with brand mentions
- File: `app/components/chef/ChefHero.tsx`
  - `chefName = "Chef Silvia"`; update any `alt` text.
- File: `app/components/product/EventProductDetails.tsx`
  - Replace `<h4>Chef Luis Velez</h4>` → `Chef Silvia`.
- File: `app/components/layout/footer/Footer.tsx`
  - Update the brand description copy to “Chef Silvia offers…” if present.
- File: `app/components/LogoStoreName/LogoStoreName.tsx`
  - No change: it reads `store.name` from `useSiteDetails()` and will reflect the root change.

#### 7) Assets
- Path: `public/assets/images/`
  - Add the new portrait, e.g. `chef-silvia.jpg` (or `.png`).
  - Update references in `app/routes/_index.tsx` (Meet Chef section) to use the new filename.

### B. Backend (Medusa) — Emails (`apps/medusa`)

#### 1) Brand config for emails
- New file: `src/modules/resend/brand.ts`
```ts
export const BRAND = {
  name: process.env.CHEF_BRAND_NAME || 'Chef Silvia',
  supportEmail: process.env.CHEF_SUPPORT_EMAIL || 'chef@chefluisvelez.com',
  phone: process.env.CHEF_PHONE || '',
};
```

#### 2) Update email templates to use `BRAND`
- Files:
  - `src/modules/resend/emails/chef-event-requested.tsx`
  - `src/modules/resend/emails/chef-event-accepted.tsx`
  - `src/modules/resend/emails/chef-event-rejected.tsx`
  - `src/modules/resend/emails/event-details-resend.tsx`
  - `src/modules/resend/emails/order-placed.tsx`
- Actions:
  - Import `BRAND` and replace hardcoded names like “Chef Elena Rodriguez” with `BRAND.name` (headers and footers).
  - Keep existing contact values unless wiring to `BRAND.supportEmail` is desired now.

#### 3) Environment variables (optional now)
- Add later when ready:
  - `CHEF_BRAND_NAME=Chef Silvia`
  - `CHEF_SUPPORT_EMAIL=<new email>`
  - `CHEF_PHONE=<optional>`

---

## CI Guard — Block “Velez” regressions

### Script
- New file: `scripts/check-no-velez.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail
rg -n --hidden --ignore-case \
  --glob '!**/node_modules/**' \
  --glob '!**/dist/**' \
  --glob '!**/build/**' \
  --glob '!**/.medusa/**' \
  'velez' || true
if rg -n --hidden --ignore-case \
  --glob '!**/node_modules/**' \
  --glob '!**/dist/**' \
  --glob '!**/build/**' \
  --glob '!**/.medusa/**' \
  'velez' > /dev/null; then
  echo "Found forbidden brand string 'Velez'. Please remove remaining references."
  exit 1
fi
```

### Package script
- `package.json` (repo root):
```json
{
  "scripts": {
    "brand:guard": "bash scripts/check-no-velez.sh"
  }
}
```

### CI integration
- Run `yarn brand:guard` before build/test in CI.

---

## Testing & Verification

- **Automated**
  - Run `yarn brand:guard` to ensure no `Velez` remains.
  - Run existing tests: `yarn test` at each app as configured.

- **Manual (Storefront)**
  - Verify header brand name reflects `Chef Silvia`.
  - Home page: hero unchanged; “Meet Chef Silvia” section shows new portrait, headings, and bio copy.
  - `How It Works`, `Request`, `Menus` pages have updated meta titles and visible mentions.
  - Footer shows Instagram linking to `silcooksforyou` if surfaced in UI.

- **Manual (Emails)**
  - Trigger email flows (event request, accepted, rejected, order placed) in a staging environment.
  - Ensure headers/footers render `Chef Silvia`.

---

## Rollout Plan

- Create feature branch, implement edits, and commit changes.
- Push branch and open PR; CI will run `brand:guard`.
- QA on staging for UI and email templates.
- Merge and deploy when approved.

### Revert Plan
- Revert PR to restore previous branding if unexpected issues occur.
- Disable `brand:guard` temporarily if blocking hotfixes, then re-enable.

---

## Acceptance Criteria
- All visible and SEO mentions read “Chef Silvia”.
- Home “Meet Chef” section contains Silvia’s bio and portrait.
- Instagram points to `silcooksforyou`.
- Medusa emails show “Chef Silvia” in headers/footers.
- CI fails when `Velez` appears in tracked files.

---

## Implementation Checklist (Quick Reference)

- Storefront
  - `libs/util/server/root.server.ts` → store name
  - `libs/config/site/site-settings.ts` → description + `social_instagram`
  - `libs/config/site/navigation-items.ts` → footer label
  - `app/root.tsx` → default meta title
  - `app/routes/_index.tsx` → SEO + Meet Chef section + alt text
  - `app/routes/how-it-works.tsx` → SEO
  - `app/routes/request._index.tsx` → SEO
  - `app/routes/request.success.tsx` → SEO (email unchanged for now)
  - `app/routes/menus._index.tsx` → SEO
  - `app/routes/menus.$menuId.tsx` → SEO + author/name
  - `app/routes/about*.tsx` → bio/copy
  - `app/components/chef/ChefHero.tsx` → name/alt
  - `app/components/product/EventProductDetails.tsx` → name
  - `public/assets/images/chef-silvia.jpg` → add and reference

- Backend (Medusa)
  - `src/modules/resend/brand.ts` → add
  - Update all templates in `src/modules/resend/emails/*` to use `BRAND.name`

- CI Guard
  - `scripts/check-no-velez.sh` → add
  - `package.json` → `brand:guard` script

