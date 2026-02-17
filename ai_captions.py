"""
AI Caption Generator
Generates social media captions and hashtags using OpenAI GPT-4
"""

from openai import OpenAI
from typing import List, Dict
import config


class CaptionGenerator:
    """Generates social media captions for real estate listings using AI"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or config.OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OpenAI API key not provided")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = config.OPENAI_MODEL
    
    def generate_captions(self, listing_data: Dict, post_type: str = "New Listing", 
                         num_variations: int = 3) -> List[Dict]:
        """
        Generate multiple caption variations for a listing
        
        Args:
            listing_data: Dictionary containing listing details
            post_type: Type of post (New Listing, Open House, etc.)
            num_variations: Number of caption variations to generate
            
        Returns:
            List of dictionaries with 'caption' and 'hashtags'
        """
        prompt = self._build_prompt(listing_data, post_type, num_variations)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert real estate social media marketer. You write engaging, professional Instagram and Facebook captions that drive engagement and inquiries."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            captions = self._parse_response(content, num_variations)
            
            return captions
            
        except Exception as e:
            raise Exception(f"Failed to generate captions: {str(e)}")
    
    def _build_prompt(self, listing_data: Dict, post_type: str, num_variations: int) -> str:
        """Build the prompt for OpenAI"""
        
        # Extract key details
        address = listing_data.get('address', 'Property')
        price = listing_data.get('price', '')
        beds = listing_data.get('bedrooms', '')
        baths = listing_data.get('bathrooms', '')
        sqft = listing_data.get('square_feet', '')
        prop_type = listing_data.get('property_type', 'Property')
        description = listing_data.get('description', '')
        features = listing_data.get('features', [])
        
        # Build property summary
        details = []
        if beds:
            details.append(f"{beds} bedroom{'s' if beds != 1 else ''}")
        if baths:
            details.append(f"{baths} bathroom{'s' if baths != 1 else ''}")
        if sqft:
            details.append(f"{sqft:,} sq ft")
        
        details_str = ", ".join(details) if details else ""
        features_str = ", ".join(features) if features else ""
        
        prompt = f"""Generate {num_variations} different Instagram/Facebook caption variations for a real estate {post_type.lower()}.

Property Details:
- Type: {prop_type}
- Address: {address}
- Price: {price}
- Specs: {details_str}
{f'- Key Features: {features_str}' if features_str else ''}
{f'- Description: {description[:200]}' if description else ''}

Requirements:
1. Create {num_variations} DISTINCT variations with different tones:
   - Variation 1: Professional and descriptive (emphasize value/features)
   - Variation 2: Warm and inviting (appeal to emotion/lifestyle)
   - Variation 3: Urgent and action-oriented (create FOMO/call-to-action)

2. Each caption should:
   - Be 100-150 words
   - Include relevant emojis (but don't overdo it)
   - Have a clear call-to-action (DM, call, visit)
   - Sound natural, not salesy
   - Highlight what makes this property special

3. Include 15-20 relevant hashtags for each caption:
   - Mix of broad (#RealEstate, #HomesForSale) and local tags
   - Property-specific tags (#LuxuryHome, #FirstTimeHomeBuyer, etc.)
   - Location-based tags (use generic if location unknown)

Format each variation exactly like this:

VARIATION 1:
[caption text here]

Hashtags: #tag1 #tag2 #tag3 [etc]

---

VARIATION 2:
[caption text here]

Hashtags: #tag1 #tag2 #tag3 [etc]

---

VARIATION 3:
[caption text here]

Hashtags: #tag1 #tag2 #tag3 [etc]

Generate now:"""
        
        return prompt
    
    def _parse_response(self, content: str, expected_count: int) -> List[Dict]:
        """Parse the AI response into structured caption data"""
        captions = []
        
        # Split by variation markers
        variations = content.split('---')
        
        for i, variation in enumerate(variations[:expected_count], 1):
            if not variation.strip():
                continue
            
            # Extract caption and hashtags
            lines = variation.strip().split('\n')
            caption_lines = []
            hashtags = ""
            
            in_caption = False
            for line in lines:
                line = line.strip()
                
                # Skip variation headers
                if line.startswith('VARIATION'):
                    in_caption = True
                    continue
                
                # Extract hashtags
                if line.lower().startswith('hashtags:'):
                    hashtags = line.split(':', 1)[1].strip()
                    break
                
                # Collect caption text
                if in_caption and line and not line.startswith('#'):
                    caption_lines.append(line)
            
            caption_text = '\n'.join(caption_lines).strip()
            
            if caption_text:
                captions.append({
                    'variation': i,
                    'caption': caption_text,
                    'hashtags': hashtags,
                    'full_text': f"{caption_text}\n\n{hashtags}",
                    'character_count': len(caption_text) + len(hashtags) + 2
                })
        
        # Ensure we have at least one caption
        if not captions:
            captions.append({
                'variation': 1,
                'caption': "Beautiful property now available! Contact us for details.",
                'hashtags': "#RealEstate #HomesForSale #Property #DreamHome",
                'full_text': "Beautiful property now available! Contact us for details.\n\n#RealEstate #HomesForSale #Property #DreamHome",
                'character_count': 100
            })
        
        return captions
    
    def generate_single_caption(self, listing_data: Dict, tone: str = "professional") -> Dict:
        """
        Generate a single caption with specific tone
        
        Args:
            listing_data: Dictionary containing listing details
            tone: Tone of caption (professional, warm, urgent)
            
        Returns:
            Dictionary with caption and hashtags
        """
        captions = self.generate_captions(listing_data, num_variations=1)
        return captions[0] if captions else None


# Convenience function
def generate_listing_captions(listing_data: Dict, post_type: str = "New Listing") -> List[Dict]:
    """
    Generate captions for a listing
    
    Args:
        listing_data: Extracted listing data from scraper
        post_type: Type of post
        
    Returns:
        List of caption variations
    """
    generator = CaptionGenerator()
    return generator.generate_captions(listing_data, post_type)


# Example usage
if __name__ == '__main__':
    # Test caption generation
    sample_listing = {
        'address': '123 Main Street',
        'price': '$450,000',
        'bedrooms': 3,
        'bathrooms': 2.5,
        'square_feet': 2100,
        'property_type': 'House',
        'description': 'Beautiful updated home in prime location',
        'features': ['Pool', 'Granite Countertops', 'Hardwood Floors']
    }
    
    try:
        generator = CaptionGenerator()
        captions = generator.generate_captions(sample_listing)
        
        print("\n" + "="*50)
        print("GENERATED CAPTIONS")
        print("="*50)
        
        for i, cap in enumerate(captions, 1):
            print(f"\n--- VARIATION {i} ---")
            print(cap['full_text'])
            print(f"\nCharacter count: {cap['character_count']}")
            
    except Exception as e:
        print(f"Error: {e}")
