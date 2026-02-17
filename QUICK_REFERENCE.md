# LRE Marketing OS - Quick Reference Card

## 📦 Installation & Upgrade

```powershell
# One-command upgrade
npm run marketing-os:upgrade

# Or manual steps
npm run db:generate
npm run db:migrate
npm run seed:agents
npm run migrate:posts
```

---

## 🎯 Post Lifecycle States

```
DRAFT → AI_GENERATED → APPROVED → SCHEDULED → POSTED
                             ↓
                          FAILED (can retry)
```

---

## 📝 Common Commands

### Database
```powershell
npm run db:studio          # Visual database editor
npm run db:generate        # Regenerate Prisma client
npm run db:migrate         # Create new migration
```

### Marketing OS
```powershell
npm run marketing-os:test  # Test caption generation
npm run seed:agents        # Update agent personalities
npm run migrate:posts      # Migrate old post statuses
```

---

## 🔧 API Endpoints

### Enhanced Caption Generation
```typescript
POST /api/generate-caption-enhanced
{
  "postId": "post_123",
  "agentId": "agent_456",
  "propertyData": {
    "address": "123 Beach Road, Ballito",
    "suburb": "Ballito",
    "price": "R3,500,000",
    "bedrooms": "3",
    "bathrooms": "2",
    "propertyType": "apartment",
    "propertyFeatures": ["Pool", "Sea Views"]
  }
}
```

### Track Engagement
```typescript
POST /api/posts/{id}/engagement
{
  "likes": 45,
  "comments": 8,
  "shares": 3,
  "reach": 2400,
  "inquiries": 2
}

PATCH /api/posts/{id}/engagement  // Record inquiry
```

### Get Insights
```typescript
GET /api/insights?limit=10              // Top patterns
GET /api/insights?agentId={id}          // Agent performance
```

### Manage Agents
```typescript
GET /api/agents                          // List all agents
POST /api/agents                         // Create agent
PATCH /api/agents/{id}                   // Update agent
```

---

## 💻 Code Snippets

### State Machine Workflow
```typescript
import { PostWorkflow } from '@/lib/post-state-machine';

// Mark AI generated
await PostWorkflow.markAIGenerated(postId);

// Approve
await PostWorkflow.approve(postId, 'agent@email.com');

// Schedule
await PostWorkflow.schedule(
  postId,
  new Date('2026-02-20T09:00:00'),
  'admin'
);

// Mark posted
await PostWorkflow.markPosted(
  postId,
  'fb_post_id',
  'fb_post_id',
  'ig_post_id'
);

// Retry failed
await PostWorkflow.retry(postId, 'admin');
```

### Content Memory
```typescript
import { recordContentMemory, recordInquiry } from '@/lib/content-memory';

// Record engagement
await recordContentMemory(postId, {
  likes: 45,
  comments: 8,
  shares: 3,
  reach: 2400,
  clicks: 12,
  inquiries: 2,
});

// Record inquiry
await recordInquiry(postId);
```

### Get Insights
```typescript
import { getTopInsights, getAgentPerformance } from '@/lib/content-memory';

// Top patterns
const insights = await getTopInsights(10);

// Agent stats
const agentStats = await getAgentPerformance('agent_123');
```

---

## 🎨 Agent Personality Options

### Tone Preferences
- `professional` - Sophisticated, elegant, corporate
- `casual` - Friendly, approachable, conversational
- `warm` - Personal, heartfelt, inviting
- `luxury` - Premium, exclusive, high-end
- `energetic` - Exciting, dynamic, enthusiastic

### Emoji Levels
- `none` - No emojis
- `minimal` - 1-2 emojis max (bullet points only)
- `moderate` - Strategic emoji use
- `enthusiastic` - Liberal emoji usage

### Platform Priority
- `instagram` - Optimize for IG (visual, lifestyle)
- `facebook` - Optimize for FB (detailed, family)
- `both` - Balanced approach

---

## 📊 Engagement Score Formula

```typescript
engagementScore = 
  likes × 1 +
  comments × 3 +
  shares × 5 +
  clicks × 2 +
  inquiries × 50  // Gold!
```

Inquiries are worth 50x likes because they're actual leads!

---

## 🏗️ Database Structure

### Key Models
- **Agent** - Team members + personality preferences
- **Post** - Listings with full lifecycle tracking
- **ContentMemory** - Performance data per post
- **InsightPattern** - Aggregated learnings
- **ABTest** - Experiment tracking

### Relationships
```
Agent ──< Post
Post ──< ContentMemory
Agent ──< ContentMemory
```

---

## 🎯 Hook Styles

The AI generates 3 variations with different hooks:

1. **Lifestyle** - Emotional appeal, how it feels to live there
2. **Investment** - Value, location benefits, growth potential
3. **Feature** - Standout property features, quality finishes

The system learns which hooks perform best for:
- Specific suburbs (e.g., Ballito)
- Price ranges (e.g., R1M-R3.5M)
- Property types (e.g., apartments)

---

## 🔄 Typical Workflow

### 1. Create Post
```typescript
const post = await prisma.post.create({
  data: {
    listingUrl: 'https://...',
    address: '123 Beach Road, Ballito',
    suburb: 'Ballito',
    price: 'R3,500,000',
    priceRange: '1m_3.5m',
    propertyType: 'apartment',
    status: 'DRAFT',
    agentId: 'agent_123',
    // ... other fields
  },
});
```

### 2. Generate Captions
```typescript
POST /api/generate-caption-enhanced
// Auto-transitions to AI_GENERATED
```

### 3. Review & Approve
```typescript
await PostWorkflow.approve(postId, 'agent@lre.co.za');
```

### 4. Schedule or Post
```typescript
await PostWorkflow.schedule(postId, scheduledDate, 'admin');
// Or immediately post
```

### 5. Track Performance
```typescript
POST /api/posts/{id}/engagement
// System learns and generates insights
```

---

## 🚨 Common Issues & Solutions

### Migration Failed
```powershell
# Restore backup
copy prisma\dev.db.backup prisma\dev.db

# Try again
npm run marketing-os:upgrade
```

### Prisma Client Out of Sync
```powershell
npm run db:generate
```

### Schema Changes Not Applied
```powershell
npm run db:migrate
# Or for direct push (dev only)
npm run db:push
```

### View Database
```powershell
npm run db:studio
```

---

## 📖 Documentation

- **[MARKETING_OS_UPGRADE.md](MARKETING_OS_UPGRADE.md)** - Full migration guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - This file

---

## 🎉 Quick Wins

1. **Set Agent Personalities** - Takes 5 minutes, huge impact
2. **Test Caption Generation** - `npm run marketing-os:test`
3. **Track First Engagement** - See the learning system in action
4. **Review Insights** - GET `/api/insights` after a few posts

---

**Happy posting!** 🏡✨
