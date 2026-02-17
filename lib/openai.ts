import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CaptionOptions {
  address: string;
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqft?: string;
  description?: string;
  agentName?: string;
  agentPhone?: string;
  propertyFeatures?: string[]; // e.g., ['Pool', 'Pets Allowed', 'Sea Views']
}

export async function generateCaptions(options: CaptionOptions) {
  const { address, price, bedrooms, bathrooms, sqft, description, agentName } = options;

  const prompt = `Generate a professional real estate Facebook post for Local Real Estate SA in this EXACT format:

Property: ${address}
${price ? `Price: ${price}` : ''}
${bedrooms ? `Bedrooms: ${bedrooms}` : ''}
${bathrooms ? `Bathrooms: ${bathrooms}` : ''}
${sqft ? `Size: ${sqft}` : ''}
${description ? `Description: ${description}` : ''}
${agentName ? `Agent: ${agentName}` : ''}

REQUIRED FORMAT (copy this structure exactly):

𝐏𝐫𝐨𝐩𝐞𝐫𝐭𝐲 𝐍𝐚𝐦𝐞/𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧 | 𝐑${price || 'X,XXX,XXX'}

EXCLUSIVE TO LOCAL REAL ESTATE! ✨

[Write 2-3 elegant, descriptive paragraphs about the property. Be sophisticated and detailed. Highlight luxury features, layout, indoor/outdoor spaces, views, and lifestyle appeal.]

🛌 ${bedrooms || 'X'} Bedrooms
🛁 ${bathrooms || 'X'} Bathrooms
🏠 ${sqft || 'XXX'} m² Floor Size
[Add 2-3 more relevant emoji bullets based on property features like: 🏊 Pool, 🐾 Pets Allowed, 🚗 Garage, ⛳ Golf Estate, 🌊 Sea Views, etc.]

👉 View full listing: Contact ${agentName || 'Agent Name'} on XXX XXX XXXX

𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽

Connecting. You.

Hashtags: #LiveLocal #[PropertyLocationName]

IMPORTANT STYLE NOTES:
- Use sophisticated, elegant language (not salesy)
- Focus on lifestyle and integrated living spaces
- Mention views, outdoor areas, entertaining spaces
- Keep it professional but warm
- Use emojis strategically in bullet points only

Generate 3 variations with different description styles:
1. Focus on luxury and elegance
2. Focus on family lifestyle and space
3. Focus on investment and location value

Return as JSON: {"captions": [{"caption": "full formatted post", "hashtags": "#LiveLocal #Location"}]}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a real estate social media expert. Generate engaging captions optimized for Instagram and Facebook.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content);
    return parsed.captions || parsed;
  } catch (error) {
    console.error('OpenAI error:', error);
    // Fallback captions matching Local Real Estate SA format
    const formattedPrice = price || 'Contact for pricing';
    const location = address?.split(',')[0] || 'Prime Location';
    
    return [
      {
        caption: `𝐄𝐥𝐞𝐠𝐚𝐧𝐭 ${bedrooms || ''}𝐁𝐞𝐝 𝐓𝐨𝐰𝐧𝐡𝐨𝐮𝐬𝐞 | ${formattedPrice}

EXCLUSIVE TO LOCAL REAL ESTATE! ✨

This stunning property offers exceptional living spaces with seamless indoor/outdoor flow. Beautifully designed with elegant finishes throughout, this home is perfect for those seeking quality and style.

🛌 ${bedrooms || 'Multiple'} Bedrooms
🛁 ${bathrooms || 'Multiple'} Bathrooms
🏠 ${sqft || 'Spacious'} m² Floor Size
🏊 Entertainment Area

👉 View full listing: Contact ${agentName || 'our agent'} for more details

𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽

Connecting. You.`,
        hashtags: '#LiveLocal #RealEstate',
      },
      {
        caption: `𝐋𝐮𝐱𝐮𝐫𝐲 𝐋𝐢𝐯𝐢𝐧𝐠 𝐢𝐧 ${location} | ${formattedPrice}

EXCLUSIVE TO LOCAL REAL ESTATE! ✨

Experience refined living in this beautiful ${bedrooms || ''} bedroom residence. Spacious interiors, quality finishes, and thoughtful design create the perfect sanctuary for modern family living.

🛌 ${bedrooms || 'Multiple'} Bedrooms
🛁 ${bathrooms || 'Multiple'} Bathrooms
🏠 ${sqft || 'Generous'} m² Floor Size
🐾 Pets Allowed

👉 View full listing: Contact ${agentName || 'our agent'} today

𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽

Connecting. You.`,
        hashtags: '#LiveLocal #PropertyGoals',
      },
      {
        caption: `${location} | ${formattedPrice}

EXCLUSIVE TO LOCAL REAL ESTATE! ✨

Discover your dream home! This immaculate property combines space, style and functionality. Perfect for families seeking a prestigious address with excellent amenities and lifestyle benefits.

🛌 ${bedrooms || 'Multiple'} Bedrooms
🛁 ${bathrooms || 'Multiple'} Bathrooms
🏠 ${sqft || 'Large'} m² Floor Size
🚗 Secure Parking

👉 View full listing: Contact ${agentName || 'our team'}

𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽

Connecting. You.`,
        hashtags: '#LiveLocal #DreamHome',
      },
    ];
  }
}
