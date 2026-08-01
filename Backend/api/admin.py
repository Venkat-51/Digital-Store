from django.contrib import admin
from .models import (
    Category, Brand, Product, ProductImage, Specification,
    UserProfile, Address, Order, OrderItem, WishlistItem
)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'customer_email', 'status', 'total', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'customer_name', 'customer_email', 'customer_phone']
    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product_name', 'unit_price', 'quantity', 'total_price']
    search_fields = ['product_name', 'order__order_number']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug']

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug']

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'is_primary']

class SpecificationInline(admin.TabularInline):
    model = Specification
    extra = 0

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'sku', 'category', 'price', 'stock', 'is_in_stock', 'is_featured', 'thumbnail']
    list_filter = ['category', 'is_featured', 'is_in_stock']
    search_fields = ['name', 'sku']
    list_editable = ['thumbnail']
    inlines = [ProductImageInline, SpecificationInline]

    def save_formset(self, request, form, formset, change):
        """When ProductImage is saved via admin, auto-sync Product.thumbnail."""
        instances = formset.save()
        if formset.model == ProductImage:
            for img in instances:
                if img.is_primary:
                    product = img.product
                    product.thumbnail = img.image
                    product.save(update_fields=['thumbnail'])
        super().save_formset(request, form, formset, change)

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'image', 'is_primary']
    list_filter = ['is_primary']
    search_fields = ['product__name']

@admin.register(Specification)
class SpecificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'name', 'value']
    search_fields = ['product__name', 'name']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone']

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'label', 'full_name', 'city', 'country', 'is_default']
