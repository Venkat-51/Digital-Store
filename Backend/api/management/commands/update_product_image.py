from django.core.management.base import BaseCommand
from api.models import Product, ProductImage


class Command(BaseCommand):
    help = """Manually update a product's image by SKU or product ID.

    Usage:
      python manage.py update_product_image --sku LGT-MXKEYS-S --url https://example.com/image.jpg
      python manage.py update_product_image --id 1 --url https://example.com/image.jpg
      python manage.py update_product_image --list   (show all products and their current images)
    """

    def add_arguments(self, parser):
        parser.add_argument('--sku', type=str, help='Product SKU to update')
        parser.add_argument('--id', type=int, help='Product ID to update')
        parser.add_argument('--url', type=str, help='New image URL')
        parser.add_argument('--list', action='store_true', help='List all products and their current images')

    def handle(self, *args, **options):
        sku = options.get('sku')
        product_id = options.get('id')
        url = options.get('url')
        list_all = options.get('list')

        if list_all:
            self._list_products()
            return

        if not url:
            self.stderr.write(self.style.ERROR("--url is required. Provide the new image URL."))
            return

        if not sku and not product_id:
            self.stderr.write(self.style.ERROR("Provide --sku or --id to identify the product."))
            return

        # Find the product
        if sku:
            product = Product.objects.filter(sku__iexact=sku.strip()).first()
        else:
            product = Product.objects.filter(id=product_id).first()

        if not product:
            self.stderr.write(self.style.ERROR(f"Product not found (sku={sku}, id={product_id})."))
            return

        url = url.strip()
        # If user passed a local filesystem path, convert it to a served URL
        normalized_url = url.replace('\\', '/')
        if 'media/products/' in normalized_url:
            filename = normalized_url.split('media/products/')[-1]
            url = f"http://127.0.0.1:8000/media/products/{filename}"
            self.stdout.write(self.style.WARNING(f"Detected filesystem path. Normalized to: {url}"))

        old_thumbnail = product.thumbnail or "(empty)"


        # Update Product.thumbnail
        product.thumbnail = url
        product.save(update_fields=['thumbnail'])

        # Update or create primary ProductImage record (keeps them in sync)
        primary_img = ProductImage.objects.filter(product=product, is_primary=True).first()
        if primary_img:
            primary_img.image = url
            primary_img.save(update_fields=['image'])
        else:
            ProductImage.objects.create(product=product, image=url, is_primary=True)

        self.stdout.write(self.style.SUCCESS(
            f"Updated '{product.name}' (SKU: {product.sku}, ID: {product.id})\n"
            f"  Old: {old_thumbnail}\n"
            f"  New: {url}"
        ))

    def _list_products(self):
        products = Product.objects.all().order_by('id')
        self.stdout.write(f"\n{'ID':<5} {'SKU':<16} {'Name':<45} {'Thumbnail'}")
        self.stdout.write("-" * 130)
        for p in products:
            thumb = (p.thumbnail or "(none)")[:55]
            self.stdout.write(f"{p.id:<5} {(p.sku or '-'):<16} {p.name:<45} {thumb}")
        self.stdout.write(f"\nTotal: {products.count()} products")
