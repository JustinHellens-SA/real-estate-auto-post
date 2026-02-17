import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ListingData {
  address?: string;
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqft?: string;
  description?: string;
  images: string[];
}

export async function scrapeListing(url: string): Promise<ListingData> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    // Generic scraping - adjust selectors based on actual website structure
    const data: ListingData = {
      images: [],
    };

    // Try common meta tags first
    data.address = 
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      $('title').text().trim();

    data.price = 
      $('meta[property="og:price:amount"]').attr('content') ||
      $('.price, .property-price, [class*="price"]').first().text().trim();

    data.description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('.description, .property-description').first().text().trim().substring(0, 500);

    // Extract images
    const imageUrls: string[] = [];
    
    // OG image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) imageUrls.push(ogImage);

    // Gallery images
    $('img[src*="property"], img[src*="listing"], .gallery img, .property-images img').each((_, elem) => {
      const src = $(elem).attr('src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        imageUrls.push(src.startsWith('http') ? src : new URL(src, url).href);
      }
    });

    data.images = [...new Set(imageUrls)].slice(0, 10); // Dedupe and limit

    // Try to extract bed/bath from text
    const fullText = $('body').text();
    
    const bedMatch = fullText.match(/(\d+)\s*(bed(room)?s?|bd)/i);
    if (bedMatch) data.bedrooms = bedMatch[1];

    const bathMatch = fullText.match(/(\d+\.?\d*)\s*(bath(room)?s?|ba)/i);
    if (bathMatch) data.bathrooms = bathMatch[1];

    const sqftMatch = fullText.match(/(\d+[\d,]*)\s*(sq\.?\s?ft|sqft|square\s?feet)/i);
    if (sqftMatch) data.sqft = sqftMatch[1].replace(/,/g, '');

    return data;
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to scrape listing. Please check the URL and try again.');
  }
}
