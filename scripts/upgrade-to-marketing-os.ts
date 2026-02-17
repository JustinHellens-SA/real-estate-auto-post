/**
 * Quick Start Script - Marketing OS Upgrade
 * 
 * Runs all migrations in correct order
 * 
 * Run with: npx tsx scripts/upgrade-to-marketing-os.ts
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 LRE Marketing OS Upgrade\n');
  console.log('═'.repeat(50));
  console.log('\n');

  // Step 1: Backup database
  console.log('📦 Step 1: Backing up database...');
  try {
    execSync('copy prisma\\dev.db prisma\\dev.db.backup', { stdio: 'inherit' });
    console.log('✅ Backup created: prisma/dev.db.backup\n');
  } catch (error) {
    console.warn('⚠️  Could not create backup (file may not exist yet)\n');
  }

  // Step 2: Generate Prisma client
  console.log('🔧 Step 2: Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client');
    throw error;
  }

  // Step 3: Run migration
  console.log('🗄️  Step 3: Running database migration...');
  try {
    execSync('npx prisma migrate dev --name marketing_os_upgrade', {
      stdio: 'inherit',
    });
    console.log('✅ Database migration complete\n');
  } catch (error) {
    console.error('❌ Migration failed');
    throw error;
  }

  // Step 4: Seed agent personalities
  console.log('👤 Step 4: Updating agent personalities...');
  try {
    execSync('npx tsx prisma/seed-agent-personalities.ts', { stdio: 'inherit' });
    console.log('');
  } catch (error) {
    console.error('❌ Failed to seed agent personalities');
    throw error;
  }

  // Step 5: Migrate post statuses
  console.log('📝 Step 5: Migrating post statuses...');
  try {
    execSync('npx tsx prisma/migrate-post-status.ts', { stdio: 'inherit' });
    console.log('');
  } catch (error) {
    console.error('❌ Failed to migrate post statuses');
    throw error;
  }

  // Step 6: Verify
  console.log('✅ Step 6: Verifying upgrade...\n');
  
  try {
    const agentCount = await prisma.agent.count();
    const postCount = await prisma.post.count();
    const memoryCount = await prisma.contentMemory.count();

    console.log('📊 Database Summary:');
    console.log(`   Agents: ${agentCount}`);
    console.log(`   Posts: ${postCount}`);
    console.log(`   Content Memories: ${memoryCount}`);
  } catch (error) {
    console.log('⚠️  Database verification skipped (tables may be empty)');
  }

  console.log('\n' + '═'.repeat(50));
  console.log('🎉 Marketing OS Upgrade Complete!\n');

  console.log('📖 Next Steps:');
  console.log('   1. Review MARKETING_OS_UPGRADE.md for usage guide');
  console.log('   2. Test enhanced caption generation:');
  console.log('      npx tsx scripts/test-enhanced-captions.ts');
  console.log('   3. Customize agent personalities via UI or API');
  console.log('   4. Start using new features!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Upgrade failed:', e);
    console.log('\n💡 Tip: Restore backup if needed:');
    console.log('   copy prisma\\dev.db.backup prisma\\dev.db\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
