import os
import sys
import requests
from urllib.parse import urlparse
from serpapi import GoogleSearch

def download_image(url, save_path):
    """Downloads an image from a URL and saves it locally."""
    try:
        # Add a user-agent to avoid being blocked by some servers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        with open(save_path, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

def get_product_images(product_name, api_key, max_results=3):
    """Searches for product images using SerpAPI and downloads them."""
    params = {
        "engine": "google",
        "q": product_name,
        "tbm": "isch", # This specifies Google Image Search
        "api_key": api_key
    }
    
    search = GoogleSearch(params)
    results = search.get_dict()
    
    if "error" in results:
        print(f"SerpAPI Error: {results['error']}")
        return []
        
    images_results = results.get("images_results", [])
    
    # Create directory for images
    output_dir = "downloaded_images"
    os.makedirs(output_dir, exist_ok=True)
    
    downloaded = []
    
    print(f"Found {len(images_results)} images, downloading top {max_results}...")
    
    for i, img in enumerate(images_results[:max_results]):
        url = img.get("original")
        if not url:
            continue
            
        print(f"Downloading {i+1}/{max_results}: {url}")
        
        # Extract extension or default to .jpg
        ext = os.path.splitext(urlparse(url).path)[1]
        if not ext or len(ext) > 5:
            ext = ".jpg"
            
        # Clean up filename
        safe_name = "".join([c if c.isalnum() else "_" for c in product_name])
        filename = f"{safe_name}_{i+1}{ext}"
        filepath = os.path.join(output_dir, filename)
        
        if download_image(url, filepath):
            downloaded.append(filepath)
            
    return downloaded

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python image_search.py <product_name>")
        sys.exit(1)
        
    product = " ".join(sys.argv[1:])
    print(f"Searching images for: {product}")
    
    # Get API key from env variable
    api_key = os.environ.get("SERPAPI_API_KEY")
    if not api_key:
        print("Error: SERPAPI_API_KEY environment variable is not set.")
        print("Please get an API key from https://serpapi.com/")
        print("Set it before running: set SERPAPI_API_KEY=your_key_here")
        sys.exit(1)
        
    saved_files = get_product_images(product, api_key, max_results=3)
    
    print("\n--- Downloaded Images ---")
    if saved_files:
        for f in saved_files:
            print(f"Saved: {f}")
    else:
        print("No images were downloaded.")
