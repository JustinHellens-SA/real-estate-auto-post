# 🚀 Getting Started with LRE Marketing OS

Welcome to your upgraded **Local Real Estate Marketing Operating System**!

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies
```powershell
npm install
```

This adds `tsx` (needed for running TypeScript scripts).

### Step 2: Run the Upgrade Script
```powershell
npm run marketing-os:upgrade
```

This automatically:
- ✅ Backs up your database
- ✅ Migrates schema to new system
- ✅ Updates agents with personality defaults
- ✅ Migrates posts to new status system
- ✅ Verifies everything worked

### Step 3: Test It Out
```powershell
npm run marketing-os:test
```

This generates sample captions with different agent personalities so you can see the system in action.

### Step 4: Explore Your Data
```powershell
npm run db:studio
```

Opens Prisma Studio - a visual database explorer.

---

## ✅ What's New?

### 🎯 Priority 1: Post State Machine
Posts now flow through clear states:
- **DRAFT** - Initial creation
- **AI_GENERATED** - AI has created captions
- **APPROVED** - Ready to post
- **SCHEDULED** - Queued for future
- **POSTED** - Successfully published
- **FAILED** - Error occurred (can retry)

Full audit trail tracks who changed what and when.

### 👤 Priority 2: Agent Personalities
Each agent can customize:
- **Tone** - professional | casual | warm | luxury | energetic
- **Emoji Level** - none | minimal | moderate | enthusiastic
- **Hashtags** - Custom hashtag packs
- **Platform** - instagram | facebook | both
- **CTA Style** - Personalized signatures

AI generates captions that blend Local Real Estate brand + agent personality.

### 📊 Priority 3: Content Memory & Learning
The system learns from performance:
- Tracks engagement (likes, comments, shares, inquiries)
- Identifies best hook styles (lifestyle, investment, feature)
- Learns patterns per suburb/price/property type
- Generates recommendations:
  > "In Ballito apartments under R3.5m, lifestyle hooks perform 42% better"

### 🧪 Bonus: A/B Testing Ready
Database supports future A/B testing, boost tracking, and advanced analytics.

---

## 📖 Your First Enhanced Post

### 1. Create a Post (via API or UI)
```typescript
const post = await prisma.post.create({
  data: {
    listingUrl: 'https://property24.com/...',
    address: '42 Compensation Beach Road, Ballito',
    suburb: 'Ballito',
    price: 'R3,500,000',
    priceRange: '1m_3.5m',
    bedrooms: '3',
    bathrooms: '2',
    sqft: '180',
    propertyType: 'apartment',
    description: 'Stunning beachfront apartment...',
    propertyImages: JSON.stringify(['img1.jpg', 'img2.jpg']),
    status: 'DRAFT',
    agentId: 'your_agent_id',
  },
});
```

### 2. Generate Enhanced Captions
```typescript
const response = await fetch('/api/generate-caption-enhanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postId: post.id,
    agentId: 'your_agent_id',
    propertyData: {
      address: '42 Compensation Beach Road, Ballito',
      suburb: 'Ballito',
      price: 'R3,500,000',
      bedrooms: '3',
      bathrooms: '2',
      sqft: '180',
      propertyType: 'apartment',
      propertyFeatures: ['Pool', 'Sea Views', 'Pets Allowed', 'Gym'],
    },
  }),
});

const { captions } = await response.json();
// Returns 3 variations: lifestyle, investment, feature
```

Post automatically transitions to `AI_GENERATED` state.

### 3. Approve & Schedule
```typescript
import { PostWorkflow } from '@/lib/post-state-machine';

// Approve
await PostWorkflow.approve(post.id, 'agent@lre.co.za');

// Schedule for tomorrow at 9am
await PostWorkflow.schedule(
  post.id,
  new Date('2026-02-18T09:00:00'),
  'admin'
);
```

### 4. Track Engagement (After Posting)
```typescript
// After 24-48 hours, record performance
await fetch(`/api/posts/${post.id}/engagement`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    likes: 52,
    comments: 11,
    shares: 4,
    reach: 2800,
    clicks: 18,
    inquiries: 3,  // Actual leads!
  }),
});
```

### 5. View Insights
```typescript
const insights = await fetch('/api/insights?limit=10');
const data = await insights.json();

console.log(data.insights);
// Shows what's working best for different suburbs/prices/types
```

---

## 🎨 Customize Agent Personalities

### Via Database (Prisma Studio)
```powershell
npm run db:studio
```
1. Open `Agent` table
2. Edit fields: `tonePreference`, `emojiLevel`, `hashtagPack`, etc.
3. Save changes

### Via API
```typescript
PATCH /api/agents/{agent-id}
{
  "tonePreference": "luxury",
  "emojiLevel": "minimal",
  "hashtagPack": ["#LuxuryLiving", "#BallitoBay", "#PremiumProperty"],
  "platformPriority": "instagram",
  "callToActionStyle": "DM me for an exclusive viewing 📱"
}
```

### Example Personalities

**Professional Agent (Corporate Properties)**
```json
{
  "tonePreference": "professional",
  "emojiLevel": "minimal",
  "hashtagPack": ["#CommercialRE", "#InvestmentProperty"],
  "platformPriority": "facebook"
}
```

**Energetic Agent (First-Time Buyers)**
```json
{
  "tonePreference": "energetic",
  "emojiLevel": "enthusiastic",
  "hashtagPack": ["#FirstHome", "#DreamHome", "#NewBeginnings"],
  "platformPriority": "instagram"
}
```

**Luxury Agent (High-End Properties)**
```json
{
  "tonePreference": "luxury",
  "emojiLevel": "moderate",
  "hashtagPack": ["#LuxuryLiving", "#PrestigeProperty", "#Exclusive"],
  "platformPriority": "instagram"
}
```

---

## 📊 Understanding Insights

After collecting data from ~10-15 posts, you'll start seeing patterns:

```typescript
GET /api/insights
```

Returns insights like:

```json
{
  "insights": [
    {
      "suburb": "Ballito",
      "propertyType": "apartment",
      "priceRange": "1m_3.5m",
      "hookStyle": "lifestyle",
      "avgEngagementScore": 247,
      "sampleSize": 12,
      "confidence": 0.85,
      "recommendation": "In Ballito, apartments (R1M-R3.5M): lifestyle hooks are performing best with avg engagement of 247"
    }
  ],
  "stats": {
    "totalPosts": 45,
    "totalMemories": 38,
    "avgEngagement": 187
  }
}
```

**Use these insights to:**
- Choose better hook styles for future posts
- Adjust agent tone for specific property types
- Optimize posting strategy per location

---

## 🔄 Automated Workflows (Future)

You can set up cron jobs or scheduled tasks for:

### 1. Auto-Post Scheduled Posts
```typescript
// scripts/auto-post-scheduled.ts
import { getPostsReadyToPost } from '@/lib/post-state-machine';

const posts = await getPostsReadyToPost();
for (const post of posts) {
  // Post to Meta, mark as POSTED
}
```

Run every 15 minutes.

### 2. Auto-Sync Engagement from Meta
```typescript
// scripts/sync-engagement.ts
const postedPosts = await prisma.post.findMany({
  where: { status: 'POSTED' },
});

for (const post of postedPosts) {
  const engagement = await fetchFromMetaAPI(post.metaPostId);
  await recordContentMemory(post.id, engagement);
}
```

Run daily.

---

## 📁 File Structure

```
real-estate-auto-post/
├── lib/
│   ├── ai-caption-enhanced.ts       # AI with personality
│   ├── post-state-machine.ts        # Workflow management
│   ├── content-memory.ts            # Learning system
│   └── ... existing files
├── app/api/
│   ├── generate-caption-enhanced/   # Enhanced caption API
│   ├── insights/                    # Analytics API
│   ├── posts/[id]/engagement/       # Engagement tracking
│   └── ... existing routes
├── prisma/
│   ├── schema.prisma                # Updated schema
│   ├── seed-agent-personalities.ts  # Migration script
│   └── migrate-post-status.ts       # Migration script
├── scripts/
│   ├── upgrade-to-marketing-os.ts   # Main upgrade script
│   └── test-enhanced-captions.ts    # Test script
├── MARKETING_OS_UPGRADE.md          # Full guide
├── IMPLEMENTATION_SUMMARY.md        # What was built
├── QUICK_REFERENCE.md               # Cheat sheet
└── GETTING_STARTED.md               # This file
```

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Run upgrade: `npm run marketing-os:upgrade`
2. ✅ Test captions: `npm run marketing-os:test`
3. ✅ Customize agent personalities in Prisma Studio

### This Week
1. Create 3-5 posts using enhanced captions
2. Track engagement manually after 24-48 hours
3. Review first insights

### Ongoing
1. Refine agent personalities based on results
2. Build frontend UI for insights dashboard
3. Set up automated posting and engagement sync
4. Run A/B tests on hook styles

---

## 🆘 Troubleshooting

### Upgrade Failed
```powershell
# Restore backup
copy prisma\dev.db.backup prisma\dev.db

# Clear and retry
npm run db:generate
npm run marketing-os:upgrade
```

### OpenAI API Errors
- Check `OPENAI_API_KEY` in `.env`
- Verify you're using `gpt-4o-mini` (or update model in code)
- Check API quota/billing

### Database Out of Sync
```powershell
npm run db:generate
npm run db:push
```

### Missing Dependencies
```powershell
npm install
```

---

## 📚 Learn More

- **[MARKETING_OS_UPGRADE.md](MARKETING_OS_UPGRADE.md)** - Detailed migration guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete feature list
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - API and code snippets

---

## 💡 Pro Tips

1. **Start with defaults** - Test the system with default personalities first
2. **Track inquiries** - They're worth 50x likes in the engagement formula!
3. **Wait for data** - Need ~10 posts before meaningful insights emerge
4. **A/B test** - Try different tones for similar properties
5. **Review weekly** - Check insights dashboard each week for learnings

---

## 🎉 You're Ready!

Your real estate posting tool is now a full **Marketing Operating System** that:
- ✅ Generates personalized AI captions
- ✅ Manages post lifecycle with audit trails
- ✅ Tracks engagement and learns patterns
- ✅ Provides data-driven recommendations
- ✅ Scales with your business

**Start creating amazing content!** 🏡✨

---

**Questions?**
- Check documentation files
- Inspect database: `npm run db:studio`
- Test captions: `npm run marketing-os:test`

**Built for Local Real Estate SA** 🤙🏽  
*Make your next move a local one*
