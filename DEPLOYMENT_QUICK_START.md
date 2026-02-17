# 🚀 Quick Deployment - Copy & Paste Commands

## Step 1: Push to GitHub (On Your Windows PC)

```powershell
cd C:\real-estate-auto-post
git init
git add .
git commit -m "Initial commit"
# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/real-estate-auto-post.git
git branch -M main
git push -u origin main
```

---

## Step 2: Server Setup (SSH: justin@192.168.23.101)

**Copy this entire block and paste into SSH:**

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt-get install -y nodejs && \
sudo npm install -g pm2 && \
sudo mkdir -p /var/www/real-estate-auto-post && \
sudo chown -R justin:justin /var/www/real-estate-auto-post && \
cd /var/www/real-estate-auto-post && \
mkdir -p logs && \
echo "✅ Server prepared! Now clone your repo:"
```

**Then clone and deploy:**

```bash
cd /var/www/real-estate-auto-post
git clone https://github.com/YOUR_USERNAME/real-estate-auto-post.git .
npm install
```

**Create `.env` file:**

```bash
nano .env
```

**Paste this and fill in real values:**

```env
OPENAI_API_KEY=sk-your-real-key-here
META_PAGE_ACCESS_TOKEN=your-real-token-here
META_PAGE_ID=your-real-page-id-here
META_INSTAGRAM_ACCOUNT_ID=your-real-instagram-id-here
META_APP_ID=your-app-id-here
META_APP_SECRET=your-app-secret-here
NEXT_PUBLIC_BASE_URL=https://posts.oneluckywave.co.za
DATABASE_URL="file:./production.db"
```

**Save with: Ctrl+X, then Y, then Enter**

**Build and start:**

```bash
npx prisma generate && \
npx prisma db push && \
npx tsx scripts/update-branding.ts && \
npm run build && \
pm2 start ecosystem.config.js && \
pm2 save && \
pm2 startup
# Run the command it outputs!
```

---

## Step 3: Configure Cloudflare Tunnel

**Find your tunnel ID:**

```bash
sudo cloudflared tunnel list
```

**Edit config:**

```bash
sudo nano /etc/cloudflared/config.yml
```

**Add your app (before the catch-all rule):**

```yaml
  - hostname: posts.oneluckywave.co.za
    service: http://localhost:3000
```

**Restart tunnel:**

```bash
sudo systemctl restart cloudflared
```

---

## Step 4: Cloudflare Dashboard

1. Go to cloudflare.com → your domain
2. DNS → Add Record:
   - Type: CNAME
   - Name: posts
   - Target: YOUR_TUNNEL_ID.cfargotunnel.com
   - Proxied: ON (orange cloud)
3. Save

---

## Step 5: Test! 🎉

Visit: **https://posts.oneluckywave.co.za**

Check logs:
```bash
pm2 logs real-estate-posts
```

---

## 🔄 To Update Later

```bash
cd /var/www/real-estate-auto-post
git pull
npm install
npm run build
pm2 restart real-estate-posts
```

Done! 🚀
