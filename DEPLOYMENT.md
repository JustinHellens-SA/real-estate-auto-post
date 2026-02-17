# Deployment Guide - posts.oneluckywave.co.za

## 🚀 Complete Deployment Steps

### Part 1: Prepare Local Repository (On Your Windows PC)

**Option A: Use PowerShell Script (Recommended)**

```powershell
cd C:\real-estate-auto-post
.\setup-git.ps1
```

**Option B: Manual Commands**

```powershell
# 1. Navigate to project
cd C:\real-estate-auto-post

# 2. Initialize Git (if not already done)
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit - Real Estate Auto Post"

# 5. Create GitHub repository (do this on github.com)
# Then link it:
git remote add origin https://github.com/YOUR_USERNAME/real-estate-auto-post.git
git branch -M main
git push -u origin main
```

---

### Part 2: Server Setup (SSH into Vortex)

**SSH into your server:**
```powershell
ssh justin@192.168.23.101
```

**Then run these commands:**
**Then run these commands:**

```bash
# 1. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Create application directory
sudo mkdir -p /var/www/real-estate-auto-post
sudo chown -R justin:justin /var/www/real-estate-auto-post

# 5. Create logs directory
mkdir -p /var/www/real-estate-auto-post/logs

# 6. Navigate to directory
cd /var/www/real-estate-auto-post

# 7. Clone your repository
git clone https://github.com/YOUR_USERNAME/real-estate-auto-post.git .

# 8. Install dependencies
npm install

# 9. Create production .env file
nano .env
# Copy contents from .env.example and fill in real values
# Change NEXT_PUBLIC_BASE_URL to: https://posts.oneluckywave.co.za
# Save with Ctrl+X, Y, Enter

# 10. Set up database
npx prisma generate
npx prisma db push

# 11. Initialize branding colors
npx tsx scripts/update-branding.ts

# 12. Build for production
npm run build

# 13. Start with PM2
pm2 start ecosystem.config.js

# 14. Save PM2 configuration
pm2 save

# 15. Set PM2 to start on boot
pm2 startup
# Follow the command it outputs (will be something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u justin --hp /home/justin

# 16. Check status
pm2 status
pm2 logs real-estate-posts --lines 50
```

---

### Part 3: Configure Cloudflare Tunnel

**On your server:**

```bash
# 1. Check existing tunnel configuration
sudo cloudflared tunnel list

# 2. Edit tunnel configuration
sudo nano /etc/cloudflared/config.yml
```

**Add this to the config file:**

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/justin/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # Real Estate Posts App
  - hostname: posts.oneluckywave.co.za
    service: http://localhost:3000
  
  # Your existing rules...
  # (keep whatever is already there)
  
  # Catch-all rule (must be last)
  - service: http_status:404
```

**Save and restart tunnel:**

```bash
sudo systemctl restart cloudflared
sudo systemctl status cloudflared
```

---

### Part 4: Configure Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select domain: **oneluckywave.co.za**
3. Go to **DNS** settings
4. Add CNAME record:
   - **Type:** CNAME
   - **Name:** posts
   - **Target:** YOUR_TUNNEL_ID.cfargotunnel.com
   - **Proxy status:** Proxied (orange cloud)
   - **TTL:** Auto
5. Click **Save**

---

### Part 5: Verify Deployment

**Test the application:**

```bash
# 1. Check PM2 status
pm2 status

# 2. Check logs
pm2 logs real-estate-posts

# 3. Test local access
curl http://localhost:3000

# 4. Check tunnel
sudo cloudflared tunnel info
```

**In browser:**
- Visit: https://posts.oneluckywave.co.za
- Should see your application! 🎉

---

## 🔄 Future Updates

**To update the app after making changes:**

```bash
# On server
cd /var/www/real-estate-auto-post

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Update database schema (if changed)
npx prisma db push

# Restart app
pm2 restart real-estate-posts

# Check logs
pm2 logs real-estate-posts --lines 50
```

---

## 🛠️ Useful Commands

```bash
# View logs in real-time
pm2 logs real-estate-posts

# Restart app
pm2 restart real-estate-posts

# Stop app
pm2 stop real-estate-posts

# Start app
pm2 start real-estate-posts

# View app status
pm2 status

# View detailed info
pm2 info real-estate-posts

# Monitor CPU/Memory
pm2 monit

# Flush logs
pm2 flush
```

---

## 🔒 Security Checklist

- [ ] `.env` file has real credentials (not committed to Git)
- [ ] Database file excluded from Git
- [ ] Cloudflare proxy enabled (orange cloud)
- [ ] PM2 starts on server reboot
- [ ] Regular backups of database file
- [ ] Meta tokens have appropriate expiry dates

---

## 📂 Important Files on Server

- **App:** `/var/www/real-estate-auto-post/`
- **Logs:** `/var/www/real-estate-auto-post/logs/`
- **Database:** `/var/www/real-estate-auto-post/production.db`
- **Env:** `/var/www/real-estate-auto-post/.env`
- **PM2 Config:** `/var/www/real-estate-auto-post/ecosystem.config.js`

---

## 🆘 Troubleshooting

**App not starting:**
```bash
pm2 logs real-estate-posts --err --lines 100
```

**Port already in use:**
```bash
sudo lsof -i :3000
# Kill the process if needed
```

**Database issues:**
```bash
cd /var/www/real-estate-auto-post
npx prisma studio
# Opens on port 5555 - access via tunnel if needed
```

**Cloudflare tunnel not working:**
```bash
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -f
```

---

## 📞 Need Help?

Check logs first:
- PM2: `pm2 logs real-estate-posts`
- System: `journalctl -xe`
- Nginx: `sudo tail -f /var/log/nginx/error.log`
- Cloudflared: `sudo journalctl -u cloudflared -f`
