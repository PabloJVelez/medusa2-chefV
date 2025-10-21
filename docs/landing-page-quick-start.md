# Landing Page Lead Capture - Quick Start Guide

## 🚀 Implementation Complete!

Your landing page lead capture system is fully implemented and ready to use.

---

## 🏃 Quick Start (3 Steps)

### Step 1: Set Environment Variables

**Backend** (`apps/medusa/.env`):
```bash
ADMIN_EMAIL=your-email@example.com
ADMIN_BACKEND_URL=http://localhost:9000
```

**Storefront** (`apps/storefront/.env`):
```bash
MEDUSA_BACKEND_URL=http://localhost:9000
```

### Step 2: Create Email Templates in Resend

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Create two templates:

**Template 1: `landing-lead-welcome`**
```
Subject: Welcome! Let's Plan Your Perfect Culinary Experience

Hi {{firstName}},

Thank you for your interest in Chef Luis Velez's culinary services!

We've received your request and will get back to you within 24 hours with:
- Available dates for your event
- A personalized quote
- Menu customization options

In the meantime, feel free to browse our sample menus at: [LINK]

Best regards,
Chef Luis Velez Team
```

**Template 2: `landing-lead-notification`**
```
Subject: New Lead: {{email}}

New lead received from landing page!

Contact Info:
- Email: {{email}}
- Name: {{firstName}} {{lastName}}
- Phone: {{phone}}

Source: {{utmSource}} / {{utmCampaign}}
Landing Page: {{landingPage}}

View in Admin: {{adminDashboardUrl}}
```

### Step 3: Test the System

```bash
# Terminal 1: Start Medusa
cd apps/medusa
npm run dev

# Terminal 2: Start Storefront
cd apps/storefront
npm run dev

# Visit: http://localhost:3000/landing
```

---

## 📍 Landing Page URL

**Development**: `http://localhost:3000/landing`

**Production**: `https://yourdomain.com/landing`

**With UTM Tracking** (recommended for ads):
```
https://yourdomain.com/landing?utm_source=facebook&utm_campaign=summer_sale&utm_medium=cpc
```

---

## 🧪 Test the Flow

1. **Visit Landing Page**: Navigate to `/landing`
2. **Enter Email**: Fill in email in the capture form
3. **Check Database**: 
   ```bash
   # Connect to your database
   psql -d medusa2
   SELECT * FROM landing_lead ORDER BY created_at DESC LIMIT 5;
   ```
4. **Check Emails**:
   - Lead receives welcome email
   - Admin receives notification email

---

## 📊 View Leads (API Examples)

```bash
# Get all leads
curl http://localhost:9000/admin/landing-leads

# Get leads by status
curl http://localhost:9000/admin/landing-leads?status=new

# Get specific lead
curl http://localhost:9000/admin/landing-leads/LEAD_ID

# Update lead
curl -X POST http://localhost:9000/admin/landing-leads/LEAD_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted", "notes": "Called customer"}'
```

---

## 🎯 For Marketing Campaigns

### Facebook Ads
```
https://yourdomain.com/landing?utm_source=facebook&utm_campaign=winter_promo&utm_medium=cpc&utm_content=ad_variant_a
```

### Google Ads
```
https://yourdomain.com/landing?utm_source=google&utm_campaign=brand_search&utm_medium=cpc&utm_term=private_chef_miami
```

### Instagram
```
https://yourdomain.com/landing?utm_source=instagram&utm_campaign=chef_stories&utm_medium=social
```

### Email Newsletter
```
https://yourdomain.com/landing?utm_source=newsletter&utm_campaign=monthly&utm_medium=email
```

---

## 🔍 Lead Status Workflow

```
NEW → CONTACTED → QUALIFIED → CONVERTED
                              ↓
                         UNSUBSCRIBED
```

**Status Definitions**:
- `new` - Just captured, needs initial contact
- `contacted` - Admin has reached out
- `qualified` - Lead is interested and viable
- `converted` - Lead booked an event/made purchase
- `unsubscribed` - Lead opted out
- `spam` - Invalid/spam lead

---

## 📈 Analytics & Tracking

### What Gets Tracked Automatically:
✅ Email address
✅ UTM parameters (source, medium, campaign, term, content)
✅ Referrer URL
✅ Landing page URL
✅ Timestamp
✅ Source (landing_page, newsletter, etc.)

### View Attribution:
```sql
-- Top performing campaigns
SELECT utm_campaign, COUNT(*) as leads
FROM landing_lead
WHERE utm_campaign IS NOT NULL
GROUP BY utm_campaign
ORDER BY leads DESC;

-- Conversion rate by source
SELECT utm_source, 
       COUNT(*) as total_leads,
       COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
       ROUND(COUNT(CASE WHEN status = 'converted' THEN 1 END)::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM landing_lead
WHERE utm_source IS NOT NULL
GROUP BY utm_source;
```

---

## 🚨 Troubleshooting

### Emails Not Sending?
1. Check `RESEND_API_KEY` in `.env`
2. Verify email templates exist in Resend dashboard
3. Check Medusa logs for errors
4. Ensure `ADMIN_EMAIL` is set correctly

### Landing Page Not Loading?
1. Check storefront is running: `npm run dev`
2. Clear browser cache
3. Check for JavaScript errors in console

### Leads Not Saving?
1. Verify database migration ran: Check for `landing_lead` table
2. Check Medusa backend logs
3. Test API directly with curl

### UTM Parameters Not Captured?
1. Ensure URL has parameters: `?utm_source=test`
2. Check browser console for JavaScript errors
3. Verify form is submitting hidden fields

---

## 📱 Mobile Testing

The landing page is fully responsive. Test on:
- Mobile browsers (Chrome, Safari)
- Tablet sizes
- Different screen orientations

Key mobile features:
- Touch-friendly buttons (44px minimum)
- Stacked layout on small screens
- Readable text sizes
- Easy-to-tap email input

---

## 🎨 Customization Guide

### Change Colors
Edit Tailwind classes in component files:
- `bg-accent-600` → Your primary color
- `text-gray-900` → Your text color

### Change Copy
All text is in the component files:
- `LandingHero.tsx` - Headline and subheadline
- `LandingEmailCapture.tsx` - Form text
- `LandingBenefits.tsx` - Benefits descriptions
- `LandingSocialProof.tsx` - Testimonials
- `LandingFAQ.tsx` - Questions and answers

### Change Images
Replace in `apps/storefront/public/assets/images/`:
- `chef_experience.jpg` - Hero background image

---

## 📞 Support

For issues or questions:
1. Check `docs/landing-page-implementation-summary.md` for detailed documentation
2. Review backend logs: `apps/medusa/logs/`
3. Check database: `SELECT * FROM landing_lead;`

---

## ✅ Pre-Launch Checklist

- [ ] Environment variables set
- [ ] Email templates created in Resend
- [ ] Test email capture form
- [ ] Test email delivery
- [ ] Check mobile responsiveness
- [ ] Set up Google Analytics (optional)
- [ ] Set up Facebook Pixel (optional)
- [ ] Test with real UTM parameters
- [ ] Verify admin can view leads
- [ ] Load test form submissions

---

## 🎉 You're Ready!

Your landing page is production-ready. Start driving traffic and capturing leads!

**Next Steps**:
1. Set up your first ad campaign
2. Monitor lead quality in admin dashboard
3. Follow up with leads within 24 hours
4. Track conversion rates
5. Optimize based on data

Good luck! 🚀

