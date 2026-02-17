# Hybrid Meta Posting Setup Guide

This guide will help you configure the application to support **both** company account posting AND individual agent personal account posting.

## 🎯 What You'll Achieve

After setup, agents can choose to post to:
- ✅ **Company Account** - Local Real Estate SA's Facebook Page & Instagram
- ✅ **Personal Account** - Their own Facebook Page & Instagram  
- ✅ **Both** - Maximum reach across company and personal networks

---

## 📋 Prerequisites

- Facebook Business Account
- Facebook Page for Local Real Estate SA
- Instagram Business Account linked to Facebook Page
- Meta Developer Account (free)

---

## Part 1: Company Account Setup (Required)

### Step 1: Get Company Page Access Token

1. Go to [Meta Business Suite](https://business.facebook.com)
2. Select your **Local Real Estate SA** Page
3. Go to **Settings** → **Business Assets** → **Pages**
4. Click on your Page
5. Scroll to **Page Access Tokens**
6. Click **Generate Token**
7. Select permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
8. Copy the token (60-day token - see below for permanent)

### Step 2: Make Token Permanent (Optional but Recommended)

Short-lived tokens expire in 60 days. To create a never-expiring token:

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your App (or create one - see Part 2)
3. Click **Get Token** → **Get Page Access Token**
4. Select your Page
5. In the field, you'll see your token
6. Copy the Page Access Token
7. Use this tool to extend it: [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)

### Step 3: Get Page and Instagram IDs

**Facebook Page ID:**
1. Go to your Facebook Page
2. Click **About**
3. Scroll to **Page ID** or look in the URL: `facebook.com/[PAGE_ID]`

**Instagram Business Account ID:**
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Enter: `me/accounts?fields=instagram_business_account`
3. Click **Submit**
4. Find your Page, copy the `instagram_business_account.id`

### Step 4: Update .env File

```env
META_PAGE_ACCESS_TOKEN=YOUR_COMPANY_PAGE_TOKEN_HERE
META_PAGE_ID=YOUR_COMPANY_PAGE_ID_HERE
META_INSTAGRAM_ACCOUNT_ID=YOUR_COMPANY_IG_ID_HERE
```

✅ **Company posting is now configured!** All agents can immediately post to the company accounts.

---

## Part 2: Agent Personal Accounts Setup (Optional)

This allows individual agents to connect their own Facebook/Instagram accounts.

### Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Click **Create App**
3. Select **Business** as app type
4. Fill in:
   - **App Name**: "Real Estate Auto Post" (or your choice)
   - **Contact Email**: Your email
5. Click **Create App**

### Step 2: Add Facebook Login Product

1. In your new app dashboard, click **Add Product**
2. Find **Facebook Login** → Click **Set Up**
3. Select **Web** platform
4. Enter Site URL: `http://localhost:3000` (for development)
   - For production, use: `https://oneluckywave.co.za`

### Step 3: Configure OAuth Settings

1. Go to **Facebook Login** → **Settings**
2. Add to **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/auth/facebook/callback
   ```
   For production, also add:
   ```
   https://oneluckywave.co.za/api/auth/facebook/callback
   ```
3. Save changes

### Step 4: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy **App ID**
3. Click **Show** to reveal **App Secret**, copy it
4. Scroll to **App Domains**, add:
   - `localhost` (development)
   - `oneluckywave.co.za` (production)

### Step 5: Request Permissions (Important!)

Your app needs these permissions to post:

1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - ✅ `pages_manage_posts` - Post to Facebook Pages
   - ✅ `pages_read_engagement` - Read Page data
   - ✅ `instagram_basic` - Access Instagram account
   - ✅ `instagram_content_publish` - Post to Instagram
   - ✅ `business_management` - Manage business assets

3. For **Development Mode** (testing):
   - Add your agents as Test Users or Developers
   - Permissions work without approval

4. For **Production** (live app):
   - Submit for App Review (Meta will review your app)
   - Provide use case: "Real estate agents post property listings to their Facebook & Instagram"
   - Can take 3-7 days for approval

### Step 6: Make App Live (When Ready)

1. Go to **Settings** → **Basic**
2. Toggle **App Mode** from **Development** to **Live**
3. Only do this AFTER permissions are approved

### Step 7: Update .env File

```env
META_APP_ID=YOUR_APP_ID_HERE
META_APP_SECRET=YOUR_APP_SECRET_HERE
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_BASE_URL=https://oneluckywave.co.za
```

✅ **Agent personal account posting is now enabled!**

---

## Part 3: Agent Connection Process

Each agent who wants to post to their personal account:

1. Go to **Agent Settings** page (`/agents`)
2. Click **"Connect Facebook Account"** button on their profile
3. They'll be redirected to Facebook OAuth
4. They must:
   - Be logged into their personal Facebook account
   - Have a Facebook Page (business page)
   - Have Instagram Business Account connected to that page
5. Grant permissions when prompted
6. They'll be redirected back - connection complete!

**Connection Status:**
- ✅ Green badge = Connected & active
- ⚠️ Yellow badge = Token expired (re-connect needed every 60 days)
- 🔵 Blue button = Not connected

---

## Part 4: Configure OpenAI (For AI Captions)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account / Sign in
3. Go to **API Keys**
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)
6. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

---

## 📝 Complete .env Example

```env
# OpenAI for AI caption generation
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Company Meta Accounts (Required - everyone uses this)
META_PAGE_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_PAGE_ID=123456789012345
META_INSTAGRAM_ACCOUNT_ID=17841234567890123

# Meta App for Agent OAuth (Optional - for personal posting)
META_APP_ID=1234567890123456
META_APP_SECRET=abcdef1234567890abcdef1234567890

# Base URL (change for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"
```

---

## 🧪 Testing

### Test Company Posting:
1. Create a post
2. Select posting mode: **Company Account**
3. Click **Post to Facebook & Instagram**
4. Check Local Real Estate SA's Facebook Page & Instagram

### Test Personal Posting:
1. Agent connects their Facebook (see Part 3)
2. Create a post
3. Select posting mode: **My Personal Account**
4. Click post
5. Check agent's personal Facebook Page & Instagram

### Test Both:
1. Select posting mode: **Both Accounts**
2. Click post
3. Check both company AND agent's accounts - should appear on both!

---

## 🚨 Troubleshooting

### "Token expired" error
- Company token expires after 60 days
- Re-generate token or create permanent token (Step 2 above)
- Agents must reconnect every 60 days (automatic prompt)

### "No Instagram Business Account" error  
- Agent's personal Facebook Page must have Instagram linked
- Go to Facebook Page Settings → Instagram → Connect Account

### OAuth errors
- Check `META_APP_ID` and `META_APP_SECRET` are correct
- Verify redirect URIs match exactly in Meta App settings
- Ensure app is in correct mode (Development vs Live)

### "Permissions not granted" error
- Agent must approve ALL requested permissions during connection
- If they clicked "Cancel" or denied permissions, have them reconnect

---

## 🎉 You're All Set!

**Company posting:** Works immediately after Part 1
**Personal posting:** Agent feature - optional, enhanced reach

Questions? Check the [Meta for Developers](https://developers.facebook.com/docs/) documentation.
