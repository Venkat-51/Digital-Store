import os
import sys
import re
import time
import argparse
import requests
from urllib.parse import urlparse

# Set up Django environment
import django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lexicon_backend.settings')
django.setup()

from api.models import Product, ProductImage
from django.conf import settings
from django.db import connection
from langchain_core.tools import tool


HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}


def force_db_reconnect():
    """Forces Django to drop dead sockets and negotiate a fresh connection."""
    try:
        if connection.connection:
            connection.close()
    except Exception:
        pass
    connection.connection = None


def db_retry(func, retries=5, delay=1.5):
    """Executes DB function with retry on serverless SSL disconnects."""
    last_err = None
    for _ in range(retries):
        try:
            force_db_reconnect()
            return func()
        except Exception as e:
            last_err = e
            time.sleep(delay)
    raise last_err


@tool
def duckduckgo_product_image_search(query: str, max_results: int = 5) -> list:
    """
    LangChain Tool: Searches DuckDuckGo for product images and returns candidate image URLs.
    Includes automatic retries and search engine fallbacks.
    """
    candidate_urls = []

    # 1. DuckDuckGo Image Search via ddgs
    try:
        from ddgs import DDGS
        for attempt in range(3):
            try:
                with DDGS(timeout=20) as ddgs:
                    results = list(ddgs.images(f"{query} product", max_results=max_results))
                    for item in results:
                        img_url = item.get('image') or item.get('thumbnail')
                        if img_url and img_url.startswith('http'):
                            candidate_urls.append(img_url)
                    if candidate_urls:
                        break
            except Exception as ex:
                time.sleep(1.5)
    except Exception as e:
        print(f"[LangChain DDG Tool Warning] DuckDuckGo search error: {e}")

    # 2. Bing Image Search Fallback
    if not candidate_urls:
        try:
            search_url = f"https://www.bing.com/images/search?q={requests.utils.quote(query + ' product')}"
            res = requests.get(search_url, headers=HEADERS, timeout=12)
            if res.status_code == 200:
                matches = re.findall(r'murl&quot;:&quot;(ht[^&]+)&quot;', res.text)
                for m in matches[:max_results]:
                    if m.startswith('http'):
                        candidate_urls.append(m)
        except Exception as ex:
            print(f"[LangChain Tool Fallback Warning] Bing fallback error: {ex}")

    return candidate_urls


def download_product_image(p_info: dict, candidate_urls: list) -> str:
    """
    Downloads candidate image file locally to media/products/<sku>.<ext>.
    Returns local file name if successful, else None.
    """
    sku = p_info['sku'] or f"prod_{p_info['id']}"
    safe_sku = "".join([c if c.isalnum() else "_" for c in sku]).lower()

    media_dir = os.path.join(settings.BASE_DIR, 'media', 'products')
    os.makedirs(media_dir, exist_ok=True)

    for url in candidate_urls:
        safe_url_str = url[:70].encode('ascii', 'ignore').decode('ascii')
        print(f"Downloading image candidate for '{p_info['name']}': {safe_url_str}...")

        try:
            resp = requests.get(url, headers=HEADERS, timeout=12, stream=True)
            if resp.status_code != 200:
                continue

            content_type = resp.headers.get('Content-Type', '').lower()
            if not ('image' in content_type or url.endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))):
                continue

            ext = os.path.splitext(urlparse(url).path)[1].lower()
            if not ext or ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
                if 'png' in content_type:
                    ext = '.png'
                elif 'webp' in content_type:
                    ext = '.webp'
                else:
                    ext = '.jpg'

            file_name = f"{safe_sku}{ext}"
            file_path = os.path.join(media_dir, file_name)

            with open(file_path, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)

            # Skip small placeholder files (< 5KB)
            if os.path.getsize(file_path) < 5000:
                os.remove(file_path)
                continue

            print(f"[DOWNLOAD SUCCESS] Saved {file_name} ({os.path.getsize(file_path)} bytes)")
            return file_name

        except Exception as err:
            print(f"Download candidate failed for {safe_url_str}: {err}")
            continue

    return None


def update_neon_db_record(product_id: int, hosted_url: str) -> str:
    """Updates database record for product thumbnail and primary ProductImage."""
    def _db_op():
        p = Product.objects.get(id=product_id)
        p.thumbnail = hosted_url
        p.save(update_fields=['thumbnail'])

        primary_img = ProductImage.objects.filter(product_id=product_id, is_primary=True).first()
        if primary_img:
            primary_img.image = hosted_url
            primary_img.save(update_fields=['image'])
        else:
            ProductImage.objects.create(product_id=product_id, image=hosted_url, is_primary=True)
        return p.name

    return db_retry(_db_op)


def sync_images_for_products(products_data: list, server_base_url: str = "http://127.0.0.1:8000"):
    """
    LangChain & DuckDuckGo product image pipeline.
    Invokes LangChain tool to fetch product image candidates, downloads them, and updates DB.
    """
    if not products_data:
        print("No products to process.")
        return 0

    print(f"\nProcessing {len(products_data)} product(s) via LangChain DuckDuckGo Tool...")
    downloaded_map = {}

    for p in products_data:
        brand_name = p.get('brand__name') or ''
        query_str = f"{p['name']} {brand_name}".strip()
        
        # Invoke LangChain Tool
        urls = duckduckgo_product_image_search.invoke({"query": query_str, "max_results": 5})
        
        if urls:
            file_name = download_product_image(p, urls)
            if file_name:
                hosted_url = f"{server_base_url.rstrip('/')}/media/products/{file_name}"
                downloaded_map[p['id']] = hosted_url
        else:
            print(f"[WARNING] No search results for '{p['name']}'")

    print(f"\nUpdating Database for {len(downloaded_map)} product(s)...")
    success_count = 0
    for prod_id, hosted_url in downloaded_map.items():
        try:
            prod_name = update_neon_db_record(prod_id, hosted_url)
            print(f"[DB UPDATED] '{prod_name}' -> {hosted_url}")
            success_count += 1
        except Exception as e:
            print(f"[DB ERROR] Failed to update product ID {prod_id}: {e}")

    print(f"\nFinished! Updated {success_count}/{len(products_data)} product images.")
    return success_count


def sync_images_for_skus(skus=None, missing_only=False, server_base_url="http://127.0.0.1:8000"):
    """Fetch product records from Django DB and launch image sync pipeline."""
    def _fetch_prods():
        qs = Product.objects.all()
        if skus:
            qs = qs.filter(sku__in=skus)
        elif missing_only:
            qs = qs.filter(thumbnail='') | qs.filter(thumbnail__isnull=True)
        return list(qs.values('id', 'name', 'sku', 'brand__name'))

    products_data = db_retry(_fetch_prods)
    force_db_reconnect()

    return sync_images_for_products(products_data, server_base_url=server_base_url)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LangChain & DuckDuckGo Product Image Sync")
    parser.add_argument('--sku', nargs='+', help='Specify SKU(s) to sync images for')
    parser.add_argument('--missing-only', action='store_true', help='Sync images only for products missing thumbnails')
    parser.add_argument('--all', action='store_true', help='Sync images for all products in the database')

    args = parser.parse_args()

    if args.sku:
        sync_images_for_skus(skus=args.sku)
    elif args.missing_only:
        sync_images_for_skus(missing_only=True)
    elif args.all:
        sync_images_for_skus(skus=None, missing_only=False)
    else:
        # Default run: sync products missing images
        print("Running LangChain & DuckDuckGo Image Sync for products missing thumbnails...")
        sync_images_for_skus(missing_only=True)
