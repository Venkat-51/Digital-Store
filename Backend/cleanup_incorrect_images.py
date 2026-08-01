import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lexicon_backend.settings')
django.setup()

from api.models import Product, ProductImage
from ai_image_search_and_sync import db_retry

media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media', 'products')
files = os.listdir(media_dir) if os.path.exists(media_dir) else []

def cleanup():
    products = Product.objects.all()
    updated_local = 0
    cleared_count = 0

    print(f"Auditing {len(products)} products against {len(files)} local media files...")

    for p in products:
        sku = p.sku or f"prod_{p.id}"
        safe_sku = "".join([c if c.isalnum() else "_" for c in sku]).lower()

        # Find matching filename in media/products/
        matches = [f for f in files if f.lower().startswith(safe_sku)]
        if matches:
            file_name = matches[0]
            hosted_url = f"http://127.0.0.1:8000/media/products/{file_name}"
            p.thumbnail = hosted_url
            p.save(update_fields=['thumbnail'])
            
            ProductImage.objects.update_or_create(
                product=p, is_primary=True,
                defaults={'image': hosted_url}
            )
            updated_local += 1
            print(f"[LINKED LOCAL] Product #{p.id} '{p.name}' (SKU: {sku}) -> {hosted_url}")
        else:
            # Check if current thumbnail is an unverified / external generic URL
            curr_thumb = p.thumbnail or ""
            if "images.unsplash.com" in curr_thumb or "http" in curr_thumb and not "127.0.0.1:8000/media/products" in curr_thumb:
                # Remove/clear incorrect image link
                p.thumbnail = ""
                p.save(update_fields=['thumbnail'])
                ProductImage.objects.filter(product=p).delete()
                cleared_count += 1
                print(f"[REMOVED INCORRECT] Product #{p.id} '{p.name}' (SKU: {sku}) -> Cleared incorrect external image '{curr_thumb}'")

    print(f"\nCleanup Finished!")
    print(f"- Linked to local verified image: {updated_local} products")
    print(f"- Cleared/removed incorrect image links: {cleared_count} products")

if __name__ == '__main__':
    db_retry(cleanup)
