import os
import sys
import requests
from urllib.parse import urlparse

# Set up Django environment
import django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lexicon_backend.settings')
django.setup()

from api.models import Product, ProductImage
from django.conf import settings

def download_and_update_product_image(sku: str, external_url: str, server_base_url: str = "http://127.0.0.1:8000"):
    """
    Downloads manufacturer image from external_url, saves locally under Backend/media/products/<sku>.<ext>,
    and updates Product.thumbnail + ProductImage in Neon PostgreSQL.
    """
    sku = sku.strip()
    product = Product.objects.filter(sku__iexact=sku).first()
    if not product:
        print(f"[ERROR] Product with SKU '{sku}' not found in Neon DB.")
        return False

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    print(f"Downloading image for '{product.name}' (SKU: {sku}) from {external_url}...")
    try:
        response = requests.get(external_url, headers=headers, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"[ERROR] Failed to download image from {external_url}: {e}")
        return False

    # Determine file extension
    parsed = urlparse(external_url)
    ext = os.path.splitext(parsed.path)[1].lower()
    if not ext or len(ext) > 5 or ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']:
        ext = ".jpg"

    # Save file locally in media/products/
    media_dir = os.path.join(settings.BASE_DIR, 'media', 'products')
    os.makedirs(media_dir, exist_ok=True)

    safe_sku = "".join([c if c.isalnum() else "_" for c in sku]).lower()
    file_name = f"{safe_sku}{ext}"
    file_path = os.path.join(media_dir, file_name)

    with open(file_path, 'wb') as f:
        f.write(response.content)

    hosted_url = f"{server_base_url.rstrip('/')}/media/products/{file_name}"

    # Update Neon DB records
    product.thumbnail = hosted_url
    product.save(update_fields=['thumbnail'])

    # Update or create primary ProductImage record
    primary_img = ProductImage.objects.filter(product=product, is_primary=True).first()
    if primary_img:
        primary_img.image = hosted_url
        primary_img.save(update_fields=['image'])
    else:
        ProductImage.objects.create(product=product, image=hosted_url, is_primary=True)

    print(f"[SUCCESS] Updated '{product.name}' (SKU: {sku}) -> {hosted_url}")
    return True

# --- SKU Map for Headsets (or any catalog products) ---
PRODUCT_IMAGE_MAP = {
    # Replace these placeholders with the official manufacturer image URLs:
    "JBR-EV2-30": "",  # Jabra Evolve2 30 Headset
    "RZR-KRK-V3": "",  # Razer Kraken V3 Gaming Headset
    "HPX-CLD-ALP": "", # HyperX Cloud Alpha Headset
    "LGT-G435":   "",  # Logitech G435 Wireless Headset
}

if __name__ == "__main__":
    if len(sys.argv) == 3:
        sku_arg = sys.argv[1]
        url_arg = sys.argv[2]
        download_and_update_product_image(sku_arg, url_arg)
    else:
        print("Starting batch update for configured SKUs...")
        updated_count = 0
        for sku, url in PRODUCT_IMAGE_MAP.items():
            if url and not url.startswith("<"):
                if download_and_update_product_image(sku, url):
                    updated_count += 1
        print(f"\nBatch processing finished. Updated {updated_count} products.")
