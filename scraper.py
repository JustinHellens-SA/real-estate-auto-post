"""
Listing Data Scraper
Extracts property details and images from real estate listing URLs
"""

import requests
from bs4 import BeautifulSoup
import re
import json
from typing import Dict, List, Optional
import validators


class ListingScraper:
    """Scrapes real estate listing data from URLs"""
    
    def __init__(self, url: str):
        self.url = url
        self.soup = None
        self.data = {}
        
    def fetch_page(self) -> bool:
        """Fetch the HTML content of the listing page"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(self.url, headers=headers, timeout=10)
            response.raise_for_status()
            self.soup = BeautifulSoup(response.content, 'lxml')
            return True
        except Exception as e:
            raise Exception(f"Failed to fetch page: {str(e)}")
    
    def extract_data(self) -> Dict:
        """Extract all relevant listing data"""
        if not self.soup:
            self.fetch_page()
        
        self.data = {
            'url': self.url,
            'title': self._extract_title(),
            'price': self._extract_price(),
            'address': self._extract_address(),
            'bedrooms': self._extract_bedrooms(),
            'bathrooms': self._extract_bathrooms(),
            'square_feet': self._extract_square_feet(),
            'description': self._extract_description(),
            'images': self._extract_images(),
            'property_type': self._extract_property_type(),
            'features': self._extract_features()
        }
        
        return self.data
    
    def _extract_title(self) -> str:
        """Extract property title"""
        # Try common title patterns
        title = None
        
        # Try meta tags first
        og_title = self.soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title['content'].strip()
        
        # Try h1 tags
        h1 = self.soup.find('h1')
        if h1:
            return h1.get_text(strip=True)
        
        # Fallback to page title
        title_tag = self.soup.find('title')
        if title_tag:
            return title_tag.get_text(strip=True)
        
        return "Property Listing"
    
    def _extract_price(self) -> str:
        """Extract property price"""
        # Look for price patterns
        patterns = [
            r'\$[\d,]+',
            r'Price[:\s]*\$?[\d,]+'
        ]
        
        # Check meta tags
        price_meta = self.soup.find('meta', property='og:price:amount')
        if price_meta and price_meta.get('content'):
            return f"${price_meta['content']}"
        
        # Search in text with common price classes/ids
        price_selectors = [
            {'class': re.compile(r'price', re.I)},
            {'id': re.compile(r'price', re.I)},
            {'data-testid': 'price'}
        ]
        
        for selector in price_selectors:
            element = self.soup.find(attrs=selector)
            if element:
                text = element.get_text(strip=True)
                match = re.search(r'\$[\d,]+', text)
                if match:
                    return match.group()
        
        # Search entire page
        text = self.soup.get_text()
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group()
        
        return "Price not listed"
    
    def _extract_address(self) -> str:
        """Extract property address"""
        # Try meta tags
        address_meta = self.soup.find('meta', property='og:street-address')
        if address_meta and address_meta.get('content'):
            return address_meta['content'].strip()
        
        # Look for address patterns
        address_selectors = [
            {'class': re.compile(r'address', re.I)},
            {'id': re.compile(r'address', re.I)},
            {'itemprop': 'address'}
        ]
        
        for selector in address_selectors:
            element = self.soup.find(attrs=selector)
            if element:
                return element.get_text(strip=True)
        
        return "Address not found"
    
    def _extract_bedrooms(self) -> Optional[int]:
        """Extract number of bedrooms"""
        patterns = [
            r'(\d+)\s*(?:bed|bd|bedroom)',
            r'(?:bed|bd|bedroom)[:\s]*(\d+)'
        ]
        
        # Check for bed/bath containers
        bed_selectors = [
            {'class': re.compile(r'bed', re.I)},
            {'data-testid': re.compile(r'bed', re.I)}
        ]
        
        for selector in bed_selectors:
            element = self.soup.find(attrs=selector)
            if element:
                text = element.get_text()
                match = re.search(r'\d+', text)
                if match:
                    return int(match.group())
        
        # Search entire page
        text = self.soup.get_text()
        for pattern in patterns:
            match = re.search(pattern, text, re.I)
            if match:
                return int(match.group(1))
        
        return None
    
    def _extract_bathrooms(self) -> Optional[float]:
        """Extract number of bathrooms"""
        patterns = [
            r'(\d+\.?\d*)\s*(?:bath|ba|bathroom)',
            r'(?:bath|ba|bathroom)[:\s]*(\d+\.?\d*)'
        ]
        
        # Check for bath containers
        bath_selectors = [
            {'class': re.compile(r'bath', re.I)},
            {'data-testid': re.compile(r'bath', re.I)}
        ]
        
        for selector in bath_selectors:
            element = self.soup.find(attrs=selector)
            if element:
                text = element.get_text()
                match = re.search(r'\d+\.?\d*', text)
                if match:
                    return float(match.group())
        
        # Search entire page
        text = self.soup.get_text()
        for pattern in patterns:
            match = re.search(pattern, text, re.I)
            if match:
                return float(match.group(1))
        
        return None
    
    def _extract_square_feet(self) -> Optional[int]:
        """Extract square footage"""
        patterns = [
            r'([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet)',
            r'(?:sq\.?\s*ft|sqft|square feet)[:\s]*([\d,]+)'
        ]
        
        text = self.soup.get_text()
        for pattern in patterns:
            match = re.search(pattern, text, re.I)
            if match:
                sqft_str = match.group(1).replace(',', '')
                return int(sqft_str)
        
        return None
    
    def _extract_description(self) -> str:
        """Extract property description"""
        # Try meta description
        meta_desc = self.soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()
        
        # Look for description sections
        desc_selectors = [
            {'class': re.compile(r'description', re.I)},
            {'id': re.compile(r'description', re.I)},
            {'itemprop': 'description'}
        ]
        
        for selector in desc_selectors:
            element = self.soup.find(attrs=selector)
            if element:
                # Get text but limit length
                text = element.get_text(strip=True)
                return text[:500] + ('...' if len(text) > 500 else '')
        
        return "No description available"
    
    def _extract_images(self) -> List[str]:
        """Extract property image URLs"""
        images = []
        
        # Try Open Graph images
        og_image = self.soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            images.append(og_image['content'])
        
        # Look for image galleries
        img_tags = self.soup.find_all('img')
        
        for img in img_tags:
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if src:
                # Filter out small images (likely icons/logos)
                if any(skip in src.lower() for skip in ['logo', 'icon', 'avatar', 'banner']):
                    continue
                
                # Make absolute URL if relative
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    from urllib.parse import urljoin
                    src = urljoin(self.url, src)
                
                if validators.url(src) and src not in images:
                    images.append(src)
        
        # Limit to first 10 images
        return images[:10]
    
    def _extract_property_type(self) -> str:
        """Extract property type (House, Condo, etc.)"""
        types = ['house', 'condo', 'townhouse', 'apartment', 'land', 'commercial']
        
        text = self.soup.get_text().lower()
        for prop_type in types:
            if prop_type in text:
                return prop_type.capitalize()
        
        return "Property"
    
    def _extract_features(self) -> List[str]:
        """Extract key property features"""
        features = []
        common_features = [
            'pool', 'garage', 'fireplace', 'hardwood', 'granite',
            'stainless steel', 'updated', 'renovated', 'new roof',
            'central air', 'walk-in closet', 'basement', 'deck', 'patio'
        ]
        
        text = self.soup.get_text().lower()
        for feature in common_features:
            if feature in text:
                features.append(feature.title())
        
        return features[:5]  # Limit to 5 features


def scrape_listing(url: str) -> Dict:
    """
    Convenience function to scrape a listing URL
    
    Args:
        url: The listing URL to scrape
        
    Returns:
        Dictionary containing all extracted listing data
    """
    if not validators.url(url):
        raise ValueError("Invalid URL provided")
    
    scraper = ListingScraper(url)
    return scraper.extract_data()


# Example usage
if __name__ == '__main__':
    # Test with a sample URL
    test_url = input("Enter listing URL: ")
    try:
        data = scrape_listing(test_url)
        print("\n" + "="*50)
        print("EXTRACTED LISTING DATA")
        print("="*50)
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error: {e}")
