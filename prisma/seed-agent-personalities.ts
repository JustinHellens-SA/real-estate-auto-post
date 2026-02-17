/**
 * Migration Script: Update existing agents with personality defaults
 * 
 * Run with: npx tsx prisma/seed-agent-personalities.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating agents with personality settings...\n');

  const agents = await prisma.agent.findMany();

  if (agents.length === 0) {
    console.log('⚠️  No agents found. Skipping...');
    return;
  }

  for (const agent of agents) {
    // Check if already has personality settings
    const hasPersonality =
      agent.tonePreference !== 'professional' ||
      agent.emojiLevel !== 'moderate' ||
      agent.hashtagPack;

    if (hasPersonality) {
      console.log(`✓ ${agent.name} - Already configured`);
      continue;
    }

    // Default hashtag pack for South African real estate
    const defaultHashtags = [
      '#LiveLocal',
      '#RealEstateSA',
      '#PropertyGoals',
      '#SouthAfricanHomes',
    ];

    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        tonePreference: 'professional',
        emojiLevel: 'moderate',
        platformPriority: 'both',
        hashtagPack: JSON.stringify(defaultHashtags),
        callToActionStyle: null, // Let them customize later
      },
    });

    console.log(`✓ ${agent.name} - Updated with default personality`);
  }

  console.log(`\n✅ Successfully updated ${agents.length} agents`);
  console.log('\n💡 Tip: Customize agent personalities via:');
  console.log('   - Agent management UI');
  console.log('   - POST /api/agents/[id] API endpoint\n');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
