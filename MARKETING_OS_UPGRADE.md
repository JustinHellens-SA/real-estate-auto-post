# LRE Marketing OS - Migration & Setup Guide

## 🎯 What's New

Your real estate auto-posting tool has been upgraded to the **Local Real Estate Marketing OS** with:

### ✅ Priority 1: Post State Machine
- **Status Flow**: `DRAFT → AI_GENERATED → APPROVED → SCHEDULED → POSTED`
- **Failure Handling**: Posts can enter `FAILED` state with retry capability
- **Status History**: Full audit trail of state transitions
- **Retry Logic**: Automatic retry counting and failure reason tracking

### ✅ Priority 2: Agent Profiles with Personality
Each agent now has customizable preferences:
- **Tone Preference**: professional | casual | warm | luxury | energetic
- **Emoji Level**: none | minimal | moderate | enthusiastic  
- **Hashtag Pack**: Custom hashtag collections per agent
- **Platform Priority**: instagram | facebook | both
- **CTA Style**: Personalized call-to-action signatures

### ✅ Priority 3: Content Memory & Learning
The system now learns from performance:
- **Engagement Tracking**: Likes, comments, shares, reach, clicks, inquiries
- **Hook Style Analysis**: Identifies which hooks work best (lifestyle, investment, feature, etc.)
- **Location Patterns**: Learns what performs in specific suburbs
- **Price Band Insights**: Different strategies for different price ranges
- **Agent Analytics**: Track individual agent performance

### ✅ Long Term: A/B Testing & Advanced Features
- **InsightPattern Model**: Aggregates learnings across posts
- **ABTest Model**: Track caption experiments
- **WhatsApp Approval**: Flag for WhatsApp-based approvals
- **Boost Tracking**: Record ad spend and boosted post performance

---

## 🚀 Migration Steps

### Step 1: Backup Your Current Database

```powershell
# Backup your existing SQLite database
Copy-Item prisma\dev.db prisma\dev.db.backup
```

### Step 2: Generate Prisma Client with New Schema

```powershell
# Install dependencies
npm install

# Generate new Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name marketing_os_upgrade
```

### Step 3: Seed Agent Personalities (Optional)

Create a seed script to add personality preferences to existing agents:

```typescript
// prisma/seed-agent-personalities.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update existing agents with default personality settings
  const agents = await prisma.agent.findMany();

  for (const agent of agents) {
    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        tonePreference: 'professional',
        emojiLevel: 'moderate',
        platformPriority: 'both',
        // Add custom hashtags if you want
        hashtagPack: JSON.stringify(['#LiveLocal', '#RealEstateSA', '#PropertyGoals']),
      },
    });
  }

  console.log(`✅ Updated ${agents.length} agents with personality settings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run it:
```powershell
npx tsx prisma/seed-agent-personalities.ts
```

### Step 4: Migrate Existing Posts to New Status System

```typescript
// prisma/migrate-post-status.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Map old status values to new enum
  const statusMap: Record<string, any> = {
    'pending': 'AI_GENERATED',  // Assume pending posts have captions
    'approved': 'APPROVED',
    'posted': 'POSTED',
    'scheduled': 'SCHEDULED',
  };

  const posts = await prisma.post.findMany();

  for (const post of posts) {
    const oldStatus = post.status;
    const newStatus = statusMap[oldStatus] || 'DRAFT';

    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: newStatus,
        statusHistory: JSON.stringify([
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            user: 'migration',
            note: `Migrated from old status: ${oldStatus}`,
          },
        ]),
      },
    });
  }

  console.log(`✅ Migrated ${posts.length} posts to new status system`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run it:
```powershell
npx tsx prisma/migrate-post-status.ts
```

---

## 📖 Usage Guide

### 1. Configure Agent Personalities

Update agent profiles via API or directly in the database:

```typescript
// Example: Update agent personality
await fetch('/api/agents/[agent-id]', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tonePreference: 'luxury',      // For high-end properties
    emojiLevel: 'minimal',          // Professional look
    hashtagPack: ['#LuxuryLiving', '#PremiumProperty', '#BallitoBay'],
    platformPriority: 'instagram',  // Focus on IG
    callToActionStyle: 'DM me for an exclusive viewing 📱',
  }),
});
```

### 2. Generate Enhanced Captions

Use the new enhanced caption generator:

```typescript
// POST /api/generate-caption-enhanced
const response = await fetch('/api/generate-caption-enhanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postId: 'post_123',
    agentId: 'agent_456',
    propertyData: {
      address: '123 Beach Road, Ballito',
      suburb: 'Ballito',
      price: 'R3,500,000',
      bedrooms: '3',
      bathrooms: '2',
      sqft: '180',
      propertyType: 'apartment',
      propertyFeatures: ['Pool', 'Sea Views', 'Pets Allowed'],
      description: 'Luxury beachfront apartment...',
    },
  }),
});

const { captions } = await response.json();
// Returns 3 caption variations with different hook styles
```

### 3. Manage Post Lifecycle

```typescript
import { PostWorkflow } from '@/lib/post-state-machine';

// Approve a post
await PostWorkflow.approve(postId, 'agent@lre.co.za');

// Schedule for later
await PostWorkflow.schedule(postId, new Date('2026-02-20T09:00:00'), 'admin');

// Mark as posted
await PostWorkflow.markPosted(postId, 'fb_12345', 'fb_12345', 'ig_67890');

// Handle failures
await markPostFailed(postId, 'Instagram API rate limit exceeded', 'system');

// Retry a failed post
await PostWorkflow.retry(postId, 'admin');
```

### 4. Track Engagement

```typescript
// Record engagement metrics
await fetch(`/api/posts/${postId}/engagement`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    likes: 45,
    comments: 8,
    shares: 3,
    reach: 2400,
    clicks: 12,
    inquiries: 2,  // Actual leads!
  }),
});

// Record an inquiry
await fetch(`/api/posts/${postId}/engagement`, {
  method: 'PATCH',
});
```

### 5. View Insights

```typescript
// Get top performing patterns
const response = await fetch('/api/insights?limit=10');
const { insights, stats } = await response.json();

// Get agent-specific performance
const agentStats = await fetch(`/api/insights?agentId=${agentId}`);
```

---

## 🎨 Frontend Integration Examples

### Agent Personality Editor Component

```typescript
// components/AgentPersonalityEditor.tsx
'use client';

import { useState } from 'react';

export default function AgentPersonalityEditor({ agentId }: { agentId: string }) {
  const [tone, setTone] = useState('professional');
  const [emoji, setEmoji] = useState('moderate');

  const saveonality = async () => {
    await fetch(`/api/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        tonePreference: tone,
        emojiLevel: emoji,
      }),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Tone Preference</label>
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="warm">Warm</option>
          <option value="luxury">Luxury</option>
          <option value="energetic">Energetic</option>
        </select>
      </div>

      <div>
        <label>Emoji Level</label>
        <select value={emoji} onChange={(e) => setEmoji(e.target.value)}>
          <option value="none">None</option>
          <option value="minimal">Minimal</option>
          <option value="moderate">Moderate</option>
          <option value="enthusiastic">Enthusiastic</option>
        </select>
      </div>

      <button onClick={savePersonality}>Save Personality</button>
    </div>
  );
}
```

### Insights Dashboard Component

```typescript
// app/insights/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetch('/api/insights')
      .then((res) => res.json())
      .then((data) => setInsights(data.insights));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📊 Content Insights</h1>

      <div className="space-y-4">
        {insights.map((insight: any) => (
          <div key={insight.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between">
              <span className="font-semibold">{insight.recommendation}</span>
              <span className="text-sm text-gray-500">
                Confidence: {Math.round(insight.confidence * 100)}%
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Based on {insight.sampleSize} posts | Avg engagement: {Math.round(insight.avgEngagementScore)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔄 Scheduled Jobs (Recommended)

Set up cron jobs or scheduled tasks for:

### 1. Process Scheduled Posts

```typescript
// scripts/process-scheduled-posts.ts
import { getPostsReadyToPost } from '@/lib/post-state-machine';
import { postToMeta } from '@/lib/meta-api-hybrid'; // Your existing posting function

async function processScheduledPosts() {
  const posts = await getPostsReadyToPost();

  for (const post of posts) {
    try {
      const result = await postToMeta(post);
      await PostWorkflow.markPosted(post.id, result.metaPostId);
    } catch (error) {
      await markPostFailed(post.id, (error as Error).message);
    }
  }
}

// Run every 15 minutes
processScheduledPosts();
```

### 2. Fetch Engagement Metrics from Meta

```typescript
// scripts/sync-engagement.ts
import { prisma } from '@/lib/prisma';
import { recordContentMemory } from '@/lib/content-memory';

async function syncEngagement() {
  const postedPosts = await prisma.post.findMany({
    where: {
      status: 'POSTED',
      metaPostId: { not: null },
    },
  });

  for (const post of postedPosts) {
    // Fetch engagement from Meta API
    const engagement = await fetchMetaEngagement(post.metaPostId!);

    await recordContentMemory(post.id, engagement);
  }
}

// Run daily
syncEngagement();
```

---

## 📊 Database Schema Overview

### Key Tables

1. **Agent** - Stores agent info + personality preferences
2. **Post** - Property listings with enhanced status tracking
3. **ContentMemory** - Performance data for each post
4. **InsightPattern** - Aggregated learnings
5. **ABTest** - A/B test experiments

### Relationships

```
Agent (1) ──< (N) Post
Post (1) ──< (1) ContentMemory
Agent (1) ──< (N) ContentMemory
```

---

## 🧪 Testing

```powershell
# Test caption generation
npx tsx scripts/test-enhanced-captions.ts

# Test state machine
npx tsx scripts/test-state-machine.ts

# Test content memory
npx tsx scripts/test-content-memory.ts
```

---

## 🎯 Next Steps

1. **Run migrations** to update your database
2. **Configure agent personalities** for your team
3. **Test enhanced caption generation** with one property
4. **Set up engagement tracking** (manual or auto-sync from Meta)
5. **Build frontend UI** for insights dashboard
6. **Schedule automated jobs** for posting and syncing

---

## 📞 Support

If you encounter issues:
1. Check migration logs
2. Verify Prisma schema is synced: `npx prisma db push`
3. Inspect database: `npx prisma studio`
4. Check API routes in `/app/api/`

---

## 🚀 Future Enhancements

Ready to implement:
- WhatsApp approval workflow
- Auto-boost best performing posts
- Caption A/B testing automation
- Multi-image carousel optimization
- Automatic hero image extraction from listings

---

**Built for Local Real Estate SA** 🏡  
*Make your next move a local one* 🤙🏽
