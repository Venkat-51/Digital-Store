from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Brand, Product, ProductImage, Specification,
    UserProfile, Address, Order, OrderItem, WishlistItem, CartItem
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary']

class SpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specification
        fields = ['id', 'name', 'value']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = serializers.SerializerMethodField()
    specifications = SpecificationSerializer(many=True, read_only=True)
    price = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'description', 'category', 'brand',
            'price', 'thumbnail', 'images', 'stock', 'is_in_stock',
            'is_featured', 'is_new', 'is_sale', 'created_at', 'updated_at',
            'specifications'
        ]

    def get_price(self, obj):
        return f"{obj.price:.2f}"

    def get_thumbnail(self, obj):
        import re
        from .utils import get_product_image_url
        url = str(obj.thumbnail or "").strip()
        if not url or "photo-1526738549149" in url or "placeholder" in url:
            return get_product_image_url(obj.name)

        if "127.0.0.1:8000" in url or "localhost:8000" in url:
            rel_path = re.sub(r'^https?://[^/]+', '', url)
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(rel_path)
            return f"http://127.0.0.1:8000{rel_path}"
        return url

    def get_images(self, obj):
        import re
        thumbnail_url = self.get_thumbnail(obj)
        existing_imgs = list(obj.images.all())
        valid_imgs = []
        request = self.context.get('request')
        for img in existing_imgs:
            img_url = str(img.image or "").strip()
            if img_url and "photo-1526738549149" not in img_url and "placeholder" not in img_url:
                if "127.0.0.1:8000" in img_url or "localhost:8000" in img_url:
                    rel_path = re.sub(r'^https?://[^/]+', '', img_url)
                    img_url = request.build_absolute_uri(rel_path) if request else f"http://127.0.0.1:8000{rel_path}"
                valid_imgs.append({"id": img.id, "image": img_url, "is_primary": img.is_primary})
        
        if valid_imgs:
            return valid_imgs
        return [{"id": 1, "image": thumbnail_url, "is_primary": True}]



class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'label', 'full_name', 'phone', 'address_line1',
            'address_line2', 'city', 'state', 'postal_code', 'country', 'is_default'
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']

    def get_product(self, obj):
        if obj.product:
            from .utils import get_product_image_url
            thumb = str(obj.product.thumbnail or "").strip()
            if not thumb or "photo-1526738549149" in thumb or "placeholder" in thumb:
                thumb = get_product_image_url(obj.product.name)
            return {
                "id": obj.product.id,
                "name": obj.product.name,
                "price": f"{obj.product.price:.2f}",
                "thumbnail": thumb,
            }
        return {"id": 0, "name": obj.product_name, "price": f"{obj.unit_price:.2f}", "thumbnail": ""}

    def get_unit_price(self, obj):
        return f"{obj.unit_price:.2f}"

    def get_total_price(self, obj):
        return f"{obj.total_price:.2f}"

import urllib.parse

class OrderSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    shipping_cost = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    whatsapp_url = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'items', 'status',
            'shipping_address', 'subtotal', 'shipping_cost', 'tax', 'total',
            'email_sent', 'email_log', 'whatsapp_sent', 'whatsapp_log', 'whatsapp_url', 'created_at', 'updated_at'
        ]


    def get_whatsapp_url(self, obj):
        target_phone = "919500882090"
        items_summary = ", ".join([f"{item.product_name} (x{item.quantity})" for item in obj.items.all()]) or "Products"
        msg = (
            f"🧾 *NEW ORDER INVOICE - LEXICON TECHNOLOGY*\n\n"
            f"📌 *Order Number*: {obj.order_number}\n"
            f"👤 *Customer*: {obj.customer_name}\n"
            f"📞 *Phone*: {obj.customer_phone}\n"
            f"✉️ *Email*: {obj.customer_email}\n"
            f"🛍️ *Items*: {items_summary}\n"
            f"💰 *Total Amount*: SGD ${obj.total:.2f}\n"
            f"Status: {obj.status.upper()}\n\n"
            f"📄 *Download Invoice*: https://lexicon-self.vercel.app/orders/{obj.order_number}\n"
        )
        return f"https://api.whatsapp.com/send?phone={target_phone}&text={urllib.parse.quote(msg)}"

    def get_customer(self, obj):
        return {
            "id": obj.user.id if obj.user else 1,
            "email": obj.customer_email,
            "first_name": obj.customer_name.split()[0] if obj.customer_name else "Customer",
            "last_name": " ".join(obj.customer_name.split()[1:]) if obj.customer_name and " " in obj.customer_name else "",
            "phone": obj.customer_phone,
            "is_staff": False,
            "is_active": True,
            "date_joined": obj.created_at.isoformat()
        }

    def get_subtotal(self, obj):
        return f"{obj.subtotal:.2f}"

    def get_shipping_cost(self, obj):
        return f"{obj.shipping_cost:.2f}"

    def get_tax(self, obj):
        return f"{obj.tax:.2f}"

    def get_total(self, obj):
        return f"{obj.total:.2f}"

class UserSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'avatar', 'is_staff', 'is_active', 'date_joined']

    def get_phone(self, obj):
        if hasattr(obj, 'profile') and obj.profile.phone and obj.profile.phone != "+65 9123 4567":
            return obj.profile.phone
        if hasattr(obj, 'addresses'):
            addr = obj.addresses.filter(is_default=True).first() or obj.addresses.first()
            if addr and addr.phone and addr.phone != "+65 9123 4567":
                return addr.phone
        if hasattr(obj, 'orders'):
            ord_obj = obj.orders.order_by('-created_at').first()
            if ord_obj and ord_obj.customer_phone and ord_obj.customer_phone != "+65 9123 4567":
                return ord_obj.customer_phone
        return ""

    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return obj.profile.avatar
        return ""

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'created_at']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'unit_price', 'total_price', 'created_at', 'updated_at']

    def get_unit_price(self, obj):
        return f"{obj.product.price:.2f}"

    def get_total_price(self, obj):
        return f"{(obj.product.price * obj.quantity):.2f}"

