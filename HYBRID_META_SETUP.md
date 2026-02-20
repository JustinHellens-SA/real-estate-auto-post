# Hybrid Meta Posting Setup Guide

**⚠️ Updated for 2026:** Meta now requires all access tokens to be generated through the [Meta for Developers](https://developers.facebook.com/apps) platform. You must create a Meta App to get tokens - the old Business Suite method no longer works.

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

## Part 1: Create Meta App (Required)

⚠️ **Important:** Meta now requires all tokens to be generated through the Meta for Developers platform. You must create an app first.

### Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. **Sign in with your personal Facebook account** (this is normal - apps are always created under personal accounts)
3. Click **Create App**
4. Select **Business** as app type
5. Fill in:
   - **App Name**: "Real Estate Auto Post" (or your choice)
   - **Contact Email**: Your email
6. Click **Create App**

**Note:** Even though you're using your personal Facebook account to create the app, the app itself will be used to manage business pages and post content. This is how Meta's system works.

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

### Step 5: Add Your Facebook Page to the App

1. Go to **App Settings** → **Basic**
2. Scroll to **App Roles** → Click **Add People**
3. Add yourself as an **Administrator**
4. Then go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
5. Select your app from the dropdown (top right)
6. Log in with your Facebook account that manages **Local Real Estate SA** Page

### Step 6: Request Permissions (Important!)

Your app needs these permissions to post:

1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - ✅ `pages_manage_posts` - Post to Facebook Pages
   - ✅ `pages_read_engagement` - Read Page data
   - ✅ `pages_show_list` - List pages
   - ✅ `instagram_basic` - Access Instagram account
   - ✅ `instagram_content_publish` - Post to Instagram
   - ✅ `business_management` - Manage business assets

3. For **Development Mode** (testing):
   - Add your agents as Test Users or Developers
   - Permissions work without approval for testing

4. For **Production** (live app):
   - Submit for App Review (Meta will review your app)
   - Provide use case: "Real estate agents post property listings to their Facebook & Instagram"
   - Can take 3-7 days for approval

---

## Part 2: Generate Company Page Access Token (Required)

Now that you have a Meta App, generate the company page token through the developer tools.

### Step 1: Generate Page Access Token via Graph API Explorer

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select **Your App** from the dropdown (top right)
3. Click **Generate Access Token** or **Get Token** → **Get User Access Token**
4. Select these permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
   - `instagram_basic`
   - `instagram_content_publish`
5. Click **Generate Access Token**
6. Approve the permissions in the popup

### Step 2: Get Page Access Token

1. Still in Graph API Explorer
2. In the query field, enter: `me/accounts`
3. Click **Submit**
4. Find your **Local Real Estate SA** page in the results
5. Copy the `access_token` for that page (this is your Page Access Token)
6. Also copy the `id` (this is your Page ID)

### Step 3: Get Instagram Business Account ID

1. In Graph API Explorer
2. Replace the query with: `me/accounts?fields=instagram_business_account`
3. Click **Submit**
4. Find your page, copy the `instagram_business_account.id`

### Step 4: (Optional) Make Token Long-Lived

Page tokens from Graph API Explorer are short-lived (60 days). To extend:

1. Go to [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
2. Paste your Page Access Token
3. Click **Debug**
4. Check expiration date
5. To extend, use this Graph API call in Explorer:
   ```
   oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
   ```
6. This gives you a token valid for 60 days (can be refreshed)

### Step 5: Update .env File

```env
# Meta App Credentials (Required for all posting)
META_APP_ID=YOUR_APP_ID_HERE
META_APP_SECRET=YOUR_APP_SECRET_HERE

# Company Meta Accounts (Required - everyone posts to this)
META_PAGE_ACCESS_TOKEN=YOUR_COMPANY_PAGE_TOKEN_HERE
META_PAGE_ID=YOUR_COMPANY_PAGE_ID_HERE
META_INSTAGRAM_ACCOUNT_ID=YOUR_COMPANY_IG_ID_HERE

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

✅ **Company posting is now configured!** All agents can immediately post to the company accounts.

---

## Part 3: Enable Agent Personal Accounts (Optional)

This allows individual agents to connect their own Facebook/Instagram accounts. The Meta App from Part 1 enables this feature.

### Step 1: Make App Live (When Ready)

1. Go to **Settings** → **Basic**
2. Toggle **App Mode** from **Development** to **Live**
3. Only do this AFTER permissions are approved (from Part 1, Step 6)

**Note:** Your Meta App is already configured from Part 1. No additional setup needed here.

✅ **Agent personal account posting is now enabled!**

---

## Part 4: Agent Connection Process

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

## Part 5: Configure OpenAI (For AI Captions)

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

# Meta App Credentials (Required for ALL posting - company and personal)
META_APP_ID=1234567890123456
META_APP_SECRET=abcdef1234567890abcdef1234567890

# Company Meta Accounts (Required - everyone uses this)
META_PAGE_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_PAGE_ID=123456789012345
META_INSTAGRAM_ACCOUNT_ID=17841234567890123

# Base URL (change for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"
```

**Important Notes:**
- `META_APP_ID` and `META_APP_SECRET` are required for both company and personal posting
- All values are obtained through [Meta for Developers](https://developers.facebook.com/apps)
- Tokens from Graph API Explorer need to be refreshed every 60 days

---

## 🧪 Testing

### Test Company Posting:
1. Create a post
2. Select posting mode: **Company Account**
3. Click **Post to Facebook & Instagram**
4. Check Local Real Estate SA's Facebook Page & Instagram

### Test Personal Posting:
1. Agent connects their Facebook (see Part 4)
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
- Re-generate token through Graph API Explorer (see Part 2)
- Extend token lifetime using the long-lived token process (Part 2, Step 4)
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

**Company posting:** Works after completing Part 1 & Part 2
**Personal posting:** Enable in Part 3, agents connect in Part 4 - optional, enhanced reach

**Quick Setup Summary:**
1. Create Meta App (Part 1) - Required
2. Generate company tokens via Graph API Explorer (Part 2) - Required  
3. Enable personal accounts (Part 3) - Optional
4. Agents connect their accounts (Part 4) - Optional per agent

Questions? Check the [Meta for Developers](https://developers.facebook.com/docs/) documentation.
