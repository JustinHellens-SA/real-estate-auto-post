import sharp from 'sharp';
import axios from 'axios';

interface BrandingSettings {
  companyName: string;
  logoUrl?: string;
  forSaleGraphic?: string;
  primaryColor: string;      // Orange #f9b32d
  secondaryColor: string;    // Dark Teal #003d51
  accentColor1?: string;     // Pink #ea4b8b
  accentColor2?: string;     // Cyan #5dc2e8
  accentColor3?: string;     // Green #92c679
  tagline: string;
}

interface BrandedImageOptions {
  propertyImageUrl: string;
  address: string;
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqft?: string;
  agentName?: string;
  agentPhone?: string;
  agentHeadshotUrl?: string;
  branding?: BrandingSettings;
}

export async function generateBrandedCoverImage(options: BrandedImageOptions): Promise<Buffer> {
  const {
    propertyImageUrl,
    address,
    price,
    bedrooms,
    bathrooms,
    sqft,
    agentName,
    agentPhone,
    agentHeadshotUrl,
    branding,
  } = options;

  try {
    // Download the property image
    const response = await axios.get(propertyImageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });
    const imageBuffer = Buffer.from(response.data);

    // Create the base image (1080x1080 for Instagram/Facebook)
    const baseImage = await sharp(imageBuffer)
      .resize(1080, 1080, {
        fit: 'cover',
        position: 'center',
      })
      .toBuffer();

    // Use branding settings or defaults (Local Real Estate SA brand colors)
    const companyName = branding?.companyName || 'LOCAL REAL ESTATE SA';
    const primaryColor = branding?.primaryColor || '#f9b32d';    // Brand Orange
    const secondaryColor = branding?.secondaryColor || '#003d51'; // Brand Dark Teal
    const accentColor = branding?.accentColor1 || '#ea4b8b';     // Brand Pink (for highlights)
    const tagline = branding?.tagline || 'MAKE YOUR NEXT MOVE A LOCAL ONE';
    
    // Create overlay with gradient and text
    const location = address.split(',')[0] || address;
    const priceText = price || 'Contact for Price';
    
    // Build property details text
    const details: string[] = [];
    if (bedrooms) details.push(`${bedrooms} Bed`);
    if (bathrooms) details.push(`${bathrooms} Bath`);
    if (sqft) details.push(`${sqft}m²`);
    const detailsText = details.join(' • ');

    // Create SVG overlay with Local Real Estate SA branding
    const svgOverlay = `
      <svg width="1080" height="1080">
        <defs>
          <!-- Gradient for bottom overlay -->
          <linearGradient id="bottomGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:rgb(0,0,0);stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
          </linearGradient>
          
          <!-- Gradient for top brand bar -->
          <linearGradient id="topGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Top brand bar -->
        <rect x="0" y="0" width="1080" height="100" fill="url(#topGrad)" />
        <text x="40" y="65" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">
          ${escapeXml(companyName)}
        </text>
        <text x="1040" y="65" font-family="Arial, sans-serif" font-size="24" font-weight="normal" fill="white" text-anchor="end">
          EXCLUSIVE
        </text>
        
        <!-- Bottom gradient overlay -->
        <rect x="0" y="680" width="1080" height="400" fill="url(#bottomGrad)" />
        
        <!-- Property details -->
        <text x="40" y="850" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
          ${escapeXml(location)}
        </text>
        
        <text x="40" y="920" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="#FFD700">
          ${escapeXml(priceText)}
        </text>
        
        ${detailsText ? `
        <text x="40" y="980" font-family="Arial, sans-serif" font-size="32" font-weight="normal" fill="white">
          ${escapeXml(detailsText)}
        </text>
        ` : ''}
        
        ${agentName ? `
        <text x="40" y="1030" font-family="Arial, sans-serif" font-size="24" font-weight="normal" fill="white">
          Contact: ${escapeXml(agentName)}${agentPhone ? ` • ${escapeXml(agentPhone)}` : ''}
        </text>
        ` : ''}
        
        <!-- Bottom tagline -->
        <text x="540" y="1060" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">
          ${escapeXml(tagline)}
        </text>
      </svg>
    `;

    // Prepare composite layers
    const compositeLayers: any[] = [
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ];

    // Add logo if provided
    if (branding?.logoUrl && branding.logoUrl.startsWith('data:image')) {
      try {
        const logoBuffer = Buffer.from(branding.logoUrl.split(',')[1], 'base64');
        const resizedLogo = await sharp(logoBuffer)
          .resize(150, 80, { fit: 'inside' })
          .toBuffer();
        
        compositeLayers.push({
          input: resizedLogo,
          top: 10,
          left: 900,
        });
      } catch (e) {
        console.error('Error adding logo:', e);
      }
    }

    // Add FOR SALE graphic if provided
    if (branding?.forSaleGraphic && branding.forSaleGraphic.startsWith('data:image')) {
      try {
        const forSaleBuffer = Buffer.from(branding.forSaleGraphic.split(',')[1], 'base64');
        const resizedForSale = await sharp(forSaleBuffer)
          .resize(200, 100, { fit: 'inside' })
          .toBuffer();
        
        compositeLayers.push({
          input: resizedForSale,
          top: 720,
          left: 40,
        });
      } catch (e) {
        console.error('Error adding FOR SALE graphic:', e);
      }
    }

    // Add agent headshot if provided
    if (agentHeadshotUrl && agentHeadshotUrl.startsWith('data:image')) {
      try {
        const headshotBuffer = Buffer.from(agentHeadshotUrl.split(',')[1], 'base64');
        const resizedHeadshot = await sharp(headshotBuffer)
          .resize(80, 80, { fit: 'cover' })
          .composite([{
            input: Buffer.from(`<svg width="80" height="80"><circle cx="40" cy="40" r="40" fill="white"/></svg>`),
            blend: 'dest-in',
          }])
          .toBuffer();
        
        compositeLayers.push({
          input: resizedHeadshot,
          top: 940,
          left: 900,
        });
      } catch (e) {
        console.error('Error adding headshot:', e);
      }
    }

    // Composite the overlays onto the image
    const finalImage = await sharp(baseImage)
      .composite(compositeLayers)
      .jpeg({ quality: 90 })
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error('Error generating branded image:', error);
    throw new Error('Failed to generate branded cover image');
  }
}

// Helper to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Alternative: Save to file system
export async function saveBrandedImage(
  options: BrandedImageOptions,
  outputPath: string
): Promise<void> {
  const imageBuffer = await generateBrandedCoverImage(options);
  await sharp(imageBuffer).toFile(outputPath);
}
