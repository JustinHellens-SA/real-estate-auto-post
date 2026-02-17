# 📋 Deployment Checklist

## Pre-Deployment (Windows PC)

### 1. Code Repository
- [ ] All code changes committed locally
- [ ] `.env` file excluded from Git (check `.gitignore`)
- [ ] `.env.example` up to date with all required variables
- [ ] `README.md` reflects current features
- [ ] No sensitive data in code

### 2. GitHub Repository
- [ ] Created repository at github.com: `real-estate-auto-post`
- [ ] Repository is private (optional but recommended)
- [ ] Local repo connected to GitHub remote
- [ ] Code pushed to `main` branch
- [ ] Repository accessible (test: `git clone` in temp folder)

### 3. API Credentials Ready
- [ ] OpenAI API key obtained from platform.openai.com
- [ ] Meta Page Access Token from wife/Meta Business Suite
- [ ] Meta Page ID from wife
- [ ] Meta Instagram Account ID from wife
- [ ] Meta App ID (if using agent OAuth)
- [ ] Meta App Secret (if using agent OAuth)

### 4. Branding Assets
- [ ] Company logo PNG file ready
- [ ] FOR SALE graphic PNG file ready
- [ ] Files sized appropriately (logo ~200x200px, graphic ~300x300px)

---

## Server Setup (SSH: justin@192.168.23.101)

### 1. Node.js Runtime
- [ ] SSH connected successfully
- [ ] Node.js 20 LTS installed (`node -v` shows v20.x.x)
- [ ] npm installed (`npm -v` shows 10.x.x)
- [ ] PM2 installed globally (`pm2 -v` works)

### 2. Application Deployment
- [ ] Directory created: `/var/www/real-estate-auto-post`
- [ ] Ownership set to justin user
- [ ] Git repository cloned successfully
- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file created with production values
- [ ] Prisma generated (`npx prisma generate`)
- [ ] Database initialized (`npx prisma db push`)
- [ ] Branding seeded (`npx tsx scripts/update-branding.ts`)

### 3. Build & Run
- [ ] Production build successful (`npm run build`)
- [ ] PM2 started app (`pm2 start ecosystem.config.js`)
- [ ] App shows in `pm2 status` as "online"
- [ ] No errors in `pm2 logs real-estate-posts`
- [ ] PM2 process saved (`pm2 save`)
- [ ] PM2 startup configured (runs on reboot)

---

## Cloudflare Tunnel Configuration

### 1. Tunnel Setup
- [ ] Tunnel ID identified (`sudo cloudflared tunnel list`)
- [ ] Config file edited: `/etc/cloudflared/config.yml`
- [ ] Entry added for posts.oneluckywave.co.za → localhost:3000
- [ ] Config syntax validated (`sudo cloudflared tunnel ingress validate`)
- [ ] Cloudflared service restarted (`sudo systemctl restart cloudflared`)
- [ ] Service shows active (`sudo systemctl status cloudflared`)
- [ ] No errors in logs (`sudo journalctl -u cloudflared -f`)

### 2. DNS Configuration
- [ ] Logged into Cloudflare dashboard
- [ ] Domain selected: oneluckywave.co.za
- [ ] CNAME record added:
  - Name: `posts`
  - Target: `TUNNEL_ID.cfargotunnel.com`
  - Proxied: ON (orange cloud)
- [ ] DNS resolves correctly (`nslookup posts.oneluckywave.co.za`)

---

## Testing & Verification

### 1. Server-Side Tests
- [ ] App responds locally: `curl http://localhost:3000`
- [ ] PM2 status shows "online"
- [ ] No errors in PM2 logs
- [ ] Database file exists: `ls -la /var/www/real-estate-auto-post/production.db`

### 2. Public Access Tests
- [ ] Visit https://posts.oneluckywave.co.za in browser
- [ ] Homepage loads correctly
- [ ] SSL certificate valid (green padlock)
- [ ] No console errors (F12)
- [ ] Navigate to /agents page
- [ ] Navigate to /branding page

### 3. Functionality Tests
- [ ] Upload logo via /branding page
- [ ] Upload FOR SALE graphic via /branding page
- [ ] Create test agent with headshot
- [ ] Paste test property URL on homepage
- [ ] AI generates captions (requires OpenAI key)
- [ ] Review page shows property details
- [ ] Photo selection works (checkboxes)
- [ ] "Where to Post" selector appears

### 4. Meta API Tests (After Credentials)
- [ ] Test post to company Facebook Page
- [ ] Test post to company Instagram
- [ ] Verify posts appear on Facebook/Instagram
- [ ] Check post formatting matches Local RE SA style
- [ ] Verify branded cover image includes logo
- [ ] Agent OAuth flow works (if configured)

---

## Post-Deployment

### 1. Documentation
- [ ] Wife has access to https://posts.oneluckywave.co.za
- [ ] Quick start guide shared with team
- [ ] Meta credentials documented securely
- [ ] PM2 commands documented for maintenance

### 2. Monitoring
- [ ] Bookmark PM2 logs command
- [ ] Set up log rotation if needed
- [ ] Test server reboot (app auto-starts)
- [ ] Monitor disk space usage

### 3. Backups
- [ ] Database backup strategy defined
- [ ] Regular backups scheduled (cron job)
- [ ] Backup location secured
- [ ] Restore process tested

### 4. Optimization (Optional)
- [ ] Enable Next.js image optimization
- [ ] Configure CDN caching rules in Cloudflare
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Add analytics (if desired)

---

## Maintenance Commands

### Regular Checks
```bash
# SSH into server
ssh justin@192.168.23.101

# Check app status
pm2 status

# View logs
pm2 logs real-estate-posts --lines 100

# Restart if needed
pm2 restart real-estate-posts

# Update code (after git push)
cd /var/www/real-estate-auto-post
git pull
npm install
npm run build
pm2 restart real-estate-posts
```

### Backup Database
```bash
# Create backup
cd /var/www/real-estate-auto-post
cp production.db backups/production-$(date +%Y%m%d-%H%M%S).db

# Or automated cron job (daily at 2 AM):
0 2 * * * cd /var/www/real-estate-auto-post && cp production.db backups/production-$(date +\%Y\%m\%d).db
```

---

## Success Criteria

✅ **Deployment Successful When:**
- [ ] https://posts.oneluckywave.co.za loads in browser
- [ ] Wife can paste listing URL and generate post
- [ ] AI creates 3 caption variations
- [ ] Branded cover image auto-generates with logo
- [ ] Photos can be selected
- [ ] Post publishes to Facebook & Instagram
- [ ] Total workflow takes 3-5 minutes (vs 45 minutes before)

---

## Emergency Contacts

**Server Issues:**
- PM2 logs: `pm2 logs real-estate-posts --err`
- Cloudflare tunnel: `sudo journalctl -u cloudflared -f`
- System: `sudo journalctl -xe`

**API Issues:**
- OpenAI status: https://status.openai.com
- Meta API status: https://developers.facebook.com/status/
- Token debug: https://developers.facebook.com/tools/debug/accesstoken/

**Disk Full:**
```bash
df -h
sudo du -sh /var/www/* | sort -h
# Clean PM2 logs: pm2 flush
```

---

## Timeline Estimate

- **Git Setup:** 5 minutes
- **Server Install (Node.js + PM2):** 10 minutes
- **App Deployment:** 15 minutes
- **Cloudflare Config:** 10 minutes
- **Testing:** 10 minutes

**Total:** ~50 minutes for first deployment

**Updates:** ~3 minutes (git pull, build, restart)

---

## 🎉 Ready to Deploy!

Follow [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) for copy-paste commands.

Or use the PowerShell script: `.\setup-git.ps1`
