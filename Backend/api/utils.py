import os
import csv
import urllib.parse
from pathlib import Path
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper

BASE_DIR = Path(__file__).resolve().parent.parent.parent

FRONTEND_PUBLIC_DIR = BASE_DIR / 'Frontend' / 'public'

def parse_csv(file_name):
    file_path = FRONTEND_PUBLIC_DIR / file_name
    data = []
    if not file_path.exists():
        return data
    with open(file_path, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)
    return data

from duckduckgo_search import DDGS

def get_product_image_url(product_name):
    query = f"{product_name} site:in.element14.com OR site:amazon.in OR site:epsglobal.com"
    
    # Attempt restricted search
    try:
        results = DDGS().images(query, max_results=1)
        if results and len(results) > 0:
            return results[0].get('image', '')
    except Exception as e:
        print(f"Restricted search failed: {e}")
        
    # Fallback to general search if restricted search fails or yields no results
    try:
        fallback_results = DDGS().images(product_name, max_results=1)
        if fallback_results and len(fallback_results) > 0:
            return fallback_results[0].get('image', '')
    except Exception as e:
        print(f"Fallback search failed: {e}")
        
    return ""
