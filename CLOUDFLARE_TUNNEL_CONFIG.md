# Cloudflare Tunnel Configuration

## 📍 Your Configuration

**Subdomain:** posts.oneluckywave.co.za  
**Local Service:** http://localhost:3000  
**Server:** Vortex (192.168.23.101)

## 🔧 Configuration File

**Location:** `/etc/cloudflared/config.yml`

**Add this entry:**

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/justin/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # Real Estate Posts App
  - hostname: posts.oneluckywave.co.za
    service: http://localhost:3000
  
  # Your existing hostnames...
  # (keep whatever rules are already there)
  
  # This MUST be the last rule
  - service: http_status:404
```

## 📝 Step-by-Step

### 1. Find Your Tunnel ID

```bash
ssh justin@192.168.23.101
sudo cloudflared tunnel list
```

Copy the tunnel ID (long UUID string).

### 2. Edit Tunnel Config

```bash
sudo nano /etc/cloudflared/config.yml
```

Add the posts.oneluckywave.co.za entry **before** the catch-all `service: http_status:404` line.

### 3. Save and Restart

```bash
# Save: Ctrl+X, Y, Enter

# Restart tunnel
sudo systemctl restart cloudflared

# Check status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

### 4. Configure DNS in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Select domain: **oneluckywave.co.za**
3. Click **DNS** in left menu
4. Click **Add record**

Fill in:
- **Type:** CNAME
- **Name:** posts
- **Target:** YOUR_TUNNEL_ID.cfargotunnel.com (replace with your actual tunnel ID)
- **Proxy status:** Proxied (orange cloud icon - ON)
- **TTL:** Auto

5. Click **Save**

### 5. Wait for DNS Propagation

Usually takes 1-5 minutes. Test with:

```bash
nslookup posts.oneluckywave.co.za
```

Should show Cloudflare IP addresses (104.x.x.x or 172.x.x.x).

### 6. Test the Connection

```bash
# Test locally on server
curl http://localhost:3000

# Check tunnel routing
sudo cloudflared tunnel info
```

In browser, visit: **https://posts.oneluckywave.co.za**

## ✅ Verification Checklist

- [ ] Tunnel ID found via `cloudflared tunnel list`
- [ ] Config file edited with posts.oneluckywave.co.za hostname
- [ ] Config entry points to http://localhost:3000
- [ ] Cloudflared service restarted successfully
- [ ] CNAME record added in Cloudflare dashboard
- [ ] Proxy (orange cloud) is enabled
- [ ] DNS resolves to Cloudflare IPs
- [ ] App accessible at https://posts.oneluckywave.co.za
- [ ] HTTPS certificate auto-provisioned by Cloudflare

## 🔍 Troubleshooting

**Tunnel won't start:**
```bash
# Check config syntax
sudo cloudflared tunnel ingress validate

# View detailed logs
sudo journalctl -u cloudflared -n 100 --no-pager
```

**DNS not resolving:**
```bash
# Clear local DNS cache (on your PC)
ipconfig /flushdns

# Check from server
dig posts.oneluckywave.co.za
```

**502 Bad Gateway:**
- App not running: `pm2 status`
- Wrong port in config (should be 3000)
- Firewall blocking localhost

**Connection timeout:**
- Check tunnel status: `sudo systemctl status cloudflared`
- Verify ingress rules order (hostname rules before catch-all)

## 📚 Additional Commands

```bash
# List all tunnels
sudo cloudflared tunnel list

# Show tunnel details
sudo cloudflared tunnel info YOUR_TUNNEL_NAME

# Test ingress rules
sudo cloudflared tunnel ingress rule https://posts.oneluckywave.co.za

# Validate config syntax
sudo cloudflared tunnel ingress validate
```

## 🔐 Security Notes

- Cloudflare automatically provisions SSL certificate (free)
- All traffic encrypted end-to-end
- No ports exposed to internet (only tunnel connection)
- Rate limiting and DDoS protection via Cloudflare
- Tunnel authenticates via credentials file

## 📖 Official Docs

- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- Configuration: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/local-management/configuration-file/
