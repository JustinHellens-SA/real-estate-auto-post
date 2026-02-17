# Real Estate Auto Post

Automated real estate social media post generator for **oneluckywave.co.za**

## Features

- 🏡 **Automatic Listing Scraping** - Paste any property URL to extract details
- 🤖 **AI Caption Generation** - Get 3 professionally written caption variations
- 📱 **Meta Integration** - Post directly to Facebook & Instagram
- 🎨 **Canva Integration** - Upload custom cover images
- 📊 **Dashboard** - Manage pending and posted content
- ⚡ **Cross-platform** - Works on Mac, Windows, mobile browsers

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Database**: SQLite (via Prisma)
- **AI**: OpenAI GPT-4
- **Meta API**: Facebook Graph API
- **Styling**: Tailwind CSS
- **Deployment**: Self-hosted on Vortex server

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Get from https://developers.facebook.com
META_ACCESS_TOKEN=YOUR_TOKEN
META_PAGE_ID=YOUR_PAGE_ID
META_INSTAGRAM_ACCOUNT_ID=YOUR_IG_ID

# Database (default is fine)
DATABASE_URL="file:./dev.db"
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Getting Meta API Credentials

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing
3. Add **Instagram** and **Facebook** products
4. Generate a **Page Access Token** with permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
5. Get your Facebook Page ID from Page Settings
6. Link Instagram Business Account to Facebook Page

## Production Deployment (Vortex Server)

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start npm --name "real-estate-post" -- start
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name oneluckywave.co.za;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Usage Workflow

1. **Create Post** - Paste listing URL from your website
2. **AI Processing** - System scrapes details & generates captions (~30s)
3. **Review** - Choose caption, upload Canva cover image
4. **Post** - One-click to Facebook & Instagram

## Time Savings

- **Before**: 45 minutes per listing
- **After**: 5-10 minutes per listing
- **~80% reduction**

## Customization

### Adjust AI Caption Style

Edit [lib/openai.ts](lib/openai.ts) - modify the prompt

### Custom Scraping Logic

Edit [lib/scraper.ts](lib/scraper.ts) - add website-specific selectors

## Troubleshooting

**Scraping not working?**
- Adjust selectors in [lib/scraper.ts](lib/scraper.ts) for your website structure

**Meta API errors?**
- Verify access token hasn't expired
- Check all permissions are granted
- Instagram must be a Business account

## Phase 2 Enhancements

- [ ] Automated Canva design via API
- [ ] Auto-detect new listings
- [ ] Performance analytics
- [ ] Post scheduling
- [ ] A/B testing
