from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    Category, Brand, Product, ProductImage, Specification,
    UserProfile, Address, Order, OrderItem
)
from api.utils import parse_csv, get_product_image_url

class Command(BaseCommand):
    help = "Seed database with initial Categories, Products, Specifications, User Profiles, Addresses, and Sample Orders."

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        # 1. Seed Categories
        categories_data = parse_csv('categories.csv')
        cat_map = {}
        for c in categories_data:
            cat_name = c.get('Category Name', '').strip()
            if not cat_name:
                continue
            cat_slug = cat_name.lower().replace(' ', '-')
            cat, _ = Category.objects.get_or_create(
                slug=cat_slug,
                defaults={
                    "name": cat_name,
                    "description": c.get('Description', ''),
                }
            )
            cat_map[cat_name.lower()] = cat

        self.stdout.write(f"Categories seeded: {Category.objects.count()}")

        # 2. Seed Brands & Products
        raw_products = parse_csv('products_template.csv')
        specs_data = parse_csv('specifications_template.csv')
        brand_map = {}

        for p in raw_products:
            prod_name = p.get('Product Name', '').strip()
            if not prod_name:
                continue

            prod_slug = prod_name.lower().replace(' ', '-')
            cat_name = p.get('Category', '').strip()
            brand_name = p.get('Brand', '').strip()

            cat_obj = cat_map.get(cat_name.lower())
            if not cat_obj and cat_name:
                cat_obj, _ = Category.objects.get_or_create(
                    slug=cat_name.lower().replace(' ', '-'),
                    defaults={"name": cat_name}
                )
                cat_map[cat_name.lower()] = cat_obj

            brand_obj = None
            if brand_name:
                brand_slug = brand_name.lower().replace(' ', '-')
                if brand_slug not in brand_map:
                    b_obj, _ = Brand.objects.get_or_create(
                        slug=brand_slug,
                        defaults={"name": brand_name}
                    )
                    brand_map[brand_slug] = b_obj
                brand_obj = brand_map[brand_slug]

            try:
                price_val = float(str(p.get('Price (SGD)', '0.00')).replace('$', '').replace(',', '').strip() or 0.0)
            except ValueError:
                price_val = 0.0

            try:
                stock_val = int(p.get('Stock', 10) or 10)
            except ValueError:
                stock_val = 10

            img_url = get_product_image_url(prod_name)

            product, created = Product.objects.get_or_create(
                slug=prod_slug,
                defaults={
                    "name": prod_name,
                    "sku": p.get('SKU', ''),
                    "description": p.get('Description', f"High quality {prod_name} from Lexicon Technology."),
                    "category": cat_obj,
                    "brand": brand_obj,
                    "price": price_val,
                    "stock": stock_val,
                    "is_in_stock": stock_val > 0,
                    "is_featured": True,
                    "is_new": True,
                    "thumbnail": img_url,
                }
            )

            # Seed Product Images
            if created or not product.images.exists():
                ProductImage.objects.create(
                    product=product,
                    image=img_url,
                    is_primary=True
                )

            # Seed Product Specifications
            if created or not product.specifications.exists():
                prod_id_str = str(p.get('Product ID', ''))
                for s in specs_data:
                    if str(s.get('Product ID', '')).strip() == prod_id_str:
                        spec_name = s.get('Specification Name', '').strip()
                        spec_val = s.get('Specification Value', '').strip()
                        if spec_name and spec_val:
                            Specification.objects.get_or_create(
                                product=product,
                                name=spec_name,
                                defaults={"value": spec_val}
                            )

        self.stdout.write(f"Products seeded: {Product.objects.count()}")

        # 3. Seed Default User & UserProfile
        user, _ = User.objects.get_or_create(
            username="guru",
            defaults={
                "email": "guru@gmail.com",
                "first_name": "guru",
                "last_name": "k",
                "is_active": True,
            }
        )
        UserProfile.objects.get_or_create(
            user=user,
            defaults={"phone": "+65 9123 4567"}
        )

        # 4. Seed Saved Address
        Address.objects.get_or_create(
            user=user,
            label="Home",
            defaults={
                "full_name": "guru k",
                "phone": "+65 9123 4567",
                "address_line1": "123 Orchard Road, #05-10",
                "city": "Singapore",
                "state": "Singapore",
                "postal_code": "238888",
                "country": "Singapore",
                "is_default": True
            }
        )

        # 5. Seed Sample Orders in Neon DB
        sample_orders_data = [
            {
                "order_number": "ORD-2026-1001",
                "customer_name": "guru k",
                "customer_email": "guru@gmail.com",
                "customer_phone": "+65 9123 4567",
                "status": "confirmed",
                "subtotal": 189.00,
                "shipping_cost": 0.00,
                "total": 189.00,
                "items": [
                    {"name": "Logitech MX Keys S Keyboard", "price": 189.00, "qty": 1}
                ]
            },
            {
                "order_number": "ORD-2026-1002",
                "customer_name": "guru k",
                "customer_email": "guru@gmail.com",
                "customer_phone": "+65 9123 4567",
                "status": "confirmed",
                "subtotal": 1185.00,
                "shipping_cost": 0.00,
                "total": 1185.00,
                "items": [
                    {"name": "Dell 24 USB-C Monitor Hub", "price": 79.00, "qty": 15}
                ]
            }
        ]

        for s_ord in sample_orders_data:
            order, o_created = Order.objects.get_or_create(
                order_number=s_ord["order_number"],
                defaults={
                    "user": user,
                    "customer_name": s_ord["customer_name"],
                    "customer_email": s_ord["customer_email"],
                    "customer_phone": s_ord["customer_phone"],
                    "status": s_ord["status"],
                    "subtotal": s_ord["subtotal"],
                    "shipping_cost": s_ord["shipping_cost"],
                    "tax": 0.00,
                    "total": s_ord["total"],
                    "shipping_address": {
                        "full_name": s_ord["customer_name"],
                        "phone": s_ord["customer_phone"],
                        "address_line1": "123 Orchard Road, #05-10",
                        "city": "Singapore",
                        "postal_code": "238888",
                        "country": "Singapore"
                    }
                }
            )
            if o_created or not order.items.exists():
                for item_data in s_ord["items"]:
                    prod_match = Product.objects.filter(name__icontains=item_data["name"].split()[0]).first()
                    OrderItem.objects.create(
                        order=order,
                        product=prod_match,
                        product_name=item_data["name"],
                        unit_price=item_data["price"],
                        quantity=item_data["qty"],
                        total_price=item_data["price"] * item_data["qty"]
                    )

        self.stdout.write(f"Orders seeded: {Order.objects.count()}")
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
