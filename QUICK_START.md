# Quick Start Guide - Real Estate Auto Post

## ✅ What's Been Built

A complete web application that automates real estate social media posting:

**Core Features:**
- Paste listing URL → Auto-extract property details
- AI generates 3 caption variations with hashtags
- Upload Canva cover image
- One-click post to Facebook & Instagram
- Dashboard to manage all posts

**Tech Stack:**
- Next.js 14 web app (works on Mac, Windows, mobile)
- OpenAI for AI captions
- Meta Graph API for social posting
- SQLite database
- Fully self-hosted (Vortex server ready)

## 🚀 Get Started NOW

### 1. Add Your API Keys

Open `.env` file and add:

```env
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxx

# Get from: https://developers.facebook.com (see DEPLOYMENT.md)
META_ACCESS_TOKEN=EAAxxxxxxxx
META_PAGE_ID=123456789
META_INSTAGRAM_ACCOUNT_ID=987654321
```

### 2. Access the App

The app is running at: **http://localhost:3000**

Open your browser (Chrome, Safari, Edge - any works!)

### 3. Test It

1. Go to http://localhost:3000
2. Paste any real estate listing URL
3. Wait ~30 seconds for AI processing
4. Review the extracted info and captions
5. Upload a Canva cover image
6. Click "Post to Facebook & Instagram"

## 📁 Project Structure

```
c:\real-estate-auto-post\
├── app/
│   ├── page.tsx              # Home page (paste URL)
│   ├── review/[id]/          # Review & edit page
│   ├── dashboard/            # View all posts
│   └── api/                  # Backend endpoints
│       ├── scrape-listing/   # URL scraper
│       ├── post-to-meta/     # Social media posting
│       └── posts/            # Database operations
├── lib/
│   ├── scraper.ts            # Web scraping logic
│   ├── openai.ts             # AI caption generation
│   ├── meta-api.ts           # Facebook/Instagram API
│   └── prisma.ts             # Database client
├── .env                      # 🔑 YOUR API KEYS GO HERE
└── README.md                 # Full documentation
```

## 🎯 Workflow

**For your wife:**

1. **Open browser** → oneluckywave.co.za (after deployment)
2. **Paste listing URL** → Click "Generate Post"
3. **Review** → Choose caption, upload Canva image
4. **Post** → One click to Facebook & Instagram

**Time saved:** 45 min → 5-10 min per post (80% reduction!)

## 🔧 Getting Meta API Credentials

You MUST get these for posting to work:

1. Go to https://developers.facebook.com
2. Create app → Add "Instagram" & "Facebook" products
3. Generate Page Access Token with permissions:
   - `pages_manage_posts`
   - `instagram_content_publish`
4. Get Page ID from Facebook Page settings
5. Link Instagram Business Account

**Full guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

## 📦 Deploy to Vortex Server

When ready for production:

```bash
# Build for production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Configure Nginx (see DEPLOYMENT.md)
```

Then access at **oneluckywave.co.za**

## 🐛 Troubleshooting

**"Scraping failed"**
- The website structure might be different
- Edit `lib/scraper.ts` with specific CSS selectors
- Test with console: Right-click listing → Inspect Element

**"Meta API error"**
- Access token expired → Regenerate in Meta Developer Console
- Permissions missing → Check token has all required scopes
- Instagram not linked → Must be Business account linked to FB Page

**App won't start**
- Check `npm run dev` logs for errors
- Verify `.env` file exists
- Run `npx prisma generate` again

## 💡 Customization Tips

### Change AI Caption Style

Edit `lib/openai.ts` → Line 24:
```typescript
const prompt = `Generate 3 engaging captions for...
Tone: [YOUR PREFERRED STYLE]
```

### Adjust Scraping for Your Website

Edit `lib/scraper.ts` → Add your site's specific selectors:
```typescript
data.price = $('.your-price-class').text();
data.address = $('.your-address-class').text();
```

### Modify UI Colors/Branding

Edit `tailwind.config.ts` and `app/globals.css`

## 📞 Next Steps

1. **Get Meta API credentials** (takes ~15 min)
2. **Add to .env file**
3. **Test with a real listing**
4. **Deploy to Vortex server**
5. **Share URL with your wife**

## 🔮 Phase 2 Ideas

- Auto-generate Canva designs (no upload needed)
- Detect new listings automatically
- Schedule posts for optimal times
- Analytics dashboard
- A/B test different captions

---

**Questions?** Check [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md)

**Ready to deploy?** Follow [DEPLOYMENT.md](DEPLOYMENT.md)
