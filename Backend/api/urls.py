from django.urls import path
from .views import (
    CategoryListView, ProductListView, ProductImageView, ProductDetailView,
    ProductFeaturedView, ProductRelatedView, AuthRegisterView, AuthLoginView,
    OrderCreateView, OrderDetailView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/featured/', ProductFeaturedView.as_view(), name='product-featured'),
    path('products/<int:product_id>/related/', ProductRelatedView.as_view(), name='product-related'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:product_id>/image/', ProductImageView.as_view(), name='product-image'),
    path('auth/register/', AuthRegisterView.as_view(), name='auth-register'),
    path('auth/login/', AuthLoginView.as_view(), name='auth-login'),
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
]
