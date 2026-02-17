// Simpler script - copy this and run in Prisma Studio or browser console
// UPDATE BrandingSettings SET 
//   primaryColor = '#f9b32d',
//   secondaryColor = '#003d51', 
//   accentColor1 = '#ea4b8b',
//   accentColor2 = '#5dc2e8',
//   accentColor3 = '#92c679'
// WHERE id = (SELECT id FROM BrandingSettings LIMIT 1);

// Or run: npx prisma studio
// Then manually update the colors in the UI

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Updating Local Real Estate SA Brand Colors...');

  // Delete any existing and create fresh
  await prisma.brandingSettings.deleteMany({});
  
  const created = await prisma.brandingSettings.create({
    data: {
      companyName: 'Local Real Estate SA',
      primaryColor: '#f9b32d',    // Orange (Pantone 1235 C)
      secondaryColor: '#003d51',  // Dark Teal (Pantone 3035 C)
      accentColor1: '#ea4b8b',    // Pink (Pantone 1915 C)
      accentColor2: '#5dc2e8',    // Cyan (Pantone 0821 C)
      accentColor3: '#92c679',    // Green (Pantone 7487 C)
      tagline: 'MAKE YOUR NEXT MOVE A LOCAL ONE',
    },
  });
  
  console.log('✅ Created branding settings:', created);
  console.log('\n🎉 Brand colors successfully set!');
  console.log('   🟠 Orange: #f9b32d');
  console.log('   🟦 Dark Teal: #003d51');
  console.log('   🩷 Pink: #ea4b8b');
  console.log('   🔵 Cyan: #5dc2e8');
  console.log('   🟢 Green: #92c679');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
