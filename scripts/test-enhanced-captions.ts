/**
 * Test Script: Enhanced Caption Generation
 * 
 * Tests the AI caption generator with agent personality and insights
 * 
 * Run with: npx tsx scripts/test-enhanced-captions.ts
 */

import { generateEnhancedCaptions } from '../lib/ai-caption-enhanced';
import type { PropertyData, AgentPersonality } from '../lib/ai-caption-enhanced';

async function main() {
  console.log('🧪 Testing Enhanced Caption Generation\n');
  console.log('═'.repeat(60));

  // Test Property Data
  const testProperty: PropertyData = {
    address: '42 Compensation Beach Road, Ballito',
    suburb: 'Ballito',
    price: 'R3,500,000',
    bedrooms: '3',
    bathrooms: '2',
    sqft: '180',
    propertyType: 'apartment',
    description:
      'Stunning beachfront apartment with panoramic ocean views. Modern finishes throughout, open-plan living, and direct beach access. Perfect for coastal living.',
    propertyFeatures: ['Pool', 'Sea Views', 'Pets Allowed', 'Secure Parking', 'Gym'],
    listingId: 'TEST_001',
  };

  console.log('\n📍 Property Details:');
  console.log(`   Address: ${testProperty.address}`);
  console.log(`   Price: ${testProperty.price}`);
  console.log(`   Type: ${testProperty.propertyType}`);
  console.log(`   Beds/Baths: ${testProperty.bedrooms}/${testProperty.bathrooms}`);

  // Test different agent personalities
  const personalities: AgentPersonality[] = [
    {
      name: 'Sarah (Professional)',
      phone: '082 123 4567',
      tonePreference: 'professional',
      emojiLevel: 'minimal',
      platformPriority: 'both',
    },
    {
      name: 'Mike (Energetic)',
      phone: '083 987 6543',
      tonePreference: 'energetic',
      emojiLevel: 'enthusiastic',
      hashtagPack: ['#BeachLife', '#BallitoBay', '#CoastalLiving'],
      platformPriority: 'instagram',
      callToActionStyle: 'DM me for an exclusive viewing! 📱✨',
    },
    {
      name: 'Emily (Luxury)',
      phone: '084 555 1234',
      tonePreference: 'luxury',
      emojiLevel: 'moderate',
      hashtagPack: ['#LuxuryLiving', '#PremiumProperty', '#ExclusiveHomes'],
      platformPriority: 'instagram',
    },
  ];

  for (const personality of personalities) {
    console.log('\n' + '─'.repeat(60));
    console.log(`\n👤 Agent: ${personality.name}`);
    console.log(`   Tone: ${personality.tonePreference}`);
    console.log(`   Emoji Level: ${personality.emojiLevel}`);
    console.log(`   Platform: ${personality.platformPriority}\n`);

    try {
      const captions = await generateEnhancedCaptions(
        testProperty,
        personality,
        false // Skip insights for test
      );

      captions.forEach((caption, index) => {
        console.log(`\n📝 Variation ${index + 1} (${caption.hookStyle} hook):`);
        console.log('─'.repeat(60));
        console.log(caption.caption);
        console.log('\n' + caption.hashtags);
        console.log('─'.repeat(60));
      });
    } catch (error) {
      console.error(`\n❌ Error generating captions for ${personality.name}:`, error);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ Test Complete!\n');
  console.log('💡 Notice how each agent generates different styles based on:');
  console.log('   - Tone preference (professional vs energetic vs luxury)');
  console.log('   - Emoji usage (minimal vs moderate vs enthusiastic)');
  console.log('   - Custom hashtags and CTAs\n');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
