import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = 'gpt-4'

# Meta API Configuration
META_ACCESS_TOKEN = os.getenv('META_ACCESS_TOKEN')
META_PAGE_ID = os.getenv('META_PAGE_ID')
META_INSTAGRAM_ACCOUNT_ID = os.getenv('META_INSTAGRAM_ACCOUNT_ID')

# Application Settings
FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# Storage Settings
DATA_DIR = 'data'
QUEUE_FILE = os.path.join(DATA_DIR, 'queue.json')
IMAGES_DIR = os.path.join(DATA_DIR, 'images')

# Agent Configuration (customize for your wife's company)
AGENTS = [
    'Sarah Johnson',
    'Mike Chen',
    'Emily Rodriguez',
    'David Kim',
    'Lisa Thompson'
]

# Color Themes for Canva
COLOR_THEMES = [
    'Blue Professional',
    'Warm Beige',
    'Modern Gray',
    'Luxury Gold',
    'Fresh Green'
]

# Post Types
POST_TYPES = [
    'New Listing',
    'Open House',
    'Just Sold',
    'Price Reduction',
    'Featured Property'
]
