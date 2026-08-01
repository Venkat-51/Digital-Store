import os
import sys

import django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lexicon_backend.settings')
django.setup()

from api.models import Product, ProductImage
from ai_image_search_and_sync import db_retry, update_neon_db_record

media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media', 'products')
if not os.path.exists(media_dir):
    print("Media directory does not exist.")
    sys.exit(0)

files = os.listdir(media_dir)
products = db_retry(lambda: list(Product.objects.all()))

print(f"Scanning {len(products)} products against {len(files)} downloaded image files...")
updated_count = 0

for p in products:
    sku = p.sku or f"prod_{p.id}"
    safe_sku = "".join([c if c.isalnum() else "_" for c in sku]).lower()

    # Find matching filename in media/products/
    matches = [f for f in files if f.lower().startswith(safe_sku)]
    if matches:
        # Prefer exact match extension if available
        file_name = matches[0]
        hosted_url = f"http://127.0.0.1:8000/media/products/{file_name}"
        try:
            update_neon_db_record(p.id, hosted_url)
            updated_count += 1
            print(f"[LINKED] Product #{p.id} '{p.name}' (SKU: {sku}) -> {hosted_url}")
        except Exception as e:
            print(f"[ERROR] Failed to update product #{p.id}: {e}")

print(f"\nCompleted linking! Total products with custom hosted images in Neon DB: {updated_count}/{len(products)}")
