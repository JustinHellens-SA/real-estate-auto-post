/**
 * Migration Script: Convert old post status to new enum system
 * 
 * Old: "pending", "approved", "posted", "scheduled"
 * New: DRAFT, AI_GENERATED, APPROVED, SCHEDULED, POSTED, FAILED
 * 
 * Run with: npx tsx prisma/migrate-post-status.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Post status type (SQLite doesn't support enums)
type PostStatus = 'DRAFT' | 'AI_GENERATED' | 'APPROVED' | 'SCHEDULED' | 'POSTED' | 'FAILED';

async function main() {
  console.log('🔄 Migrating posts to new status system...\n');

  // Get all posts
  const posts = await prisma.post.findMany();

  if (posts.length === 0) {
    console.log('⚠️  No posts found. Nothing to migrate.');
    return;
  }

  const statusMap: Record<string, PostStatus> = {
    'draft': 'DRAFT',
    'pending': 'AI_GENERATED',   // Assume pending means AI has generated captions
    'approved': 'APPROVED',
    'scheduled': 'SCHEDULED',
    'posted': 'POSTED',
    'failed': 'FAILED',
  };

  let migrated = 0;
  let skipped = 0;

  for (const post of posts) {
    const oldStatus = post.status.toLowerCase();
    const newStatus = statusMap[oldStatus];

    if (!newStatus) {
      console.log(`⚠️  Unknown status "${post.status}" for post ${post.id} - defaulting to DRAFT`);
    }

    const finalStatus = newStatus || 'DRAFT';

    try {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: finalStatus,
          statusHistory: JSON.stringify([
            {
              status: finalStatus,
              timestamp: new Date().toISOString(),
              user: 'migration_script',
              note: `Migrated from old status: "${post.status}"`,
            },
          ]),
          // Ensure new fields have defaults
          listingId: post.listingId || null,
          suburb: post.suburb || extractSuburb(post.address),
          priceRange: post.priceRange || categorizePrice(post.price),
          propertyType: post.propertyType || 'property',
          retryCount: post.retryCount || 0,
          whatsappApprovalSent: false,
        },
      });

      console.log(`✓ ${post.address} - ${post.status} → ${finalStatus}`);
      migrated++;
    } catch (error) {
      console.error(`❌ Failed to migrate post ${post.id}:`, error);
      skipped++;
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${posts.length}\n`);
}

/**
 * Helper: Extract suburb from address
 */
function extractSuburb(address: string): string | null {
  // Simple extraction - take second part of comma-separated address
  const parts = address.split(',').map((p) => p.trim());
  return parts[1] || parts[0] || null;
}

/**
 * Helper: Categorize price into range
 */
function categorizePrice(price?: string | null): string | null {
  if (!price) return null;

  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));

  if (isNaN(numericPrice)) return null;

  // Assuming South African Rand
  if (numericPrice < 1000000) return 'under_1m';
  if (numericPrice < 3500000) return '1m_3.5m';
  if (numericPrice < 5000000) return '3.5m_5m';
  return 'over_5m';
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
