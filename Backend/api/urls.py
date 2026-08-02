from django.urls import path
from .views import (
    CategoryListView, ProductListView, ProductImageView, ProductDetailView,
    ProductFeaturedView, ProductRelatedView, AuthRegisterView, AuthLoginView,
    AuthMeView, AuthLogoutView, AuthPasswordResetView, AuthPasswordResetConfirmView,
    AuthTokenRefreshView, AuthGoogleView, OrderCreateView, OrderDetailView, OrderCancelView, OrderInvoiceView,
    AddressListView, AddressDetailView, AddressSetDefaultView, WishlistView, CartView,
    ProductCSVTemplateView, ProductBulkUploadView,
    AdminOrderListView, AdminOrderUpdateStatusView, AdminCustomerListView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/csv-template/', ProductCSVTemplateView.as_view(), name='product-csv-template'),
    path('products/bulk-upload/', ProductBulkUploadView.as_view(), name='product-bulk-upload'),
    path('products/featured/', ProductFeaturedView.as_view(), name='product-featured'),
    path('products/<int:product_id>/related/', ProductRelatedView.as_view(), name='product-related'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:product_id>/image/', ProductImageView.as_view(), name='product-image'),
    path('auth/register/', AuthRegisterView.as_view(), name='auth-register'),
    path('auth/login/', AuthLoginView.as_view(), name='auth-login'),
    path('auth/google/', AuthGoogleView.as_view(), name='auth-google'),
    path('auth/google', AuthGoogleView.as_view(), name='auth-google-no-slash'),
    path('auth/me/', AuthMeView.as_view(), name='auth-me'),
    path('auth/logout/', AuthLogoutView.as_view(), name='auth-logout'),
    path('auth/password/reset/', AuthPasswordResetView.as_view(), name='auth-password-reset'),
    path('auth/password/reset/confirm/', AuthPasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('auth/token/refresh/', AuthTokenRefreshView.as_view(), name='auth-token-refresh'),
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail-pk'),
    path('orders/<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel-pk'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<str:order_number>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    path('orders/<str:order_number>/invoice/', OrderInvoiceView.as_view(), name='order-invoice'),
    path('addresses/', AddressListView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
    path('addresses/<int:pk>/set-default/', AddressSetDefaultView.as_view(), name='address-set-default'),
    path('wishlist/', WishlistView.as_view(), name='wishlist-list'),
    path('wishlist/<int:item_id>/', WishlistView.as_view(), name='wishlist-detail'),
    path('cart/', CartView.as_view(), name='cart-list'),
    path('cart/clear/', CartView.as_view(), name='cart-clear'),
    path('cart/<int:item_id>/', CartView.as_view(), name='cart-detail'),
    # Admin Endpoints
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<int:pk>/status/', AdminOrderUpdateStatusView.as_view(), name='admin-order-update-status'),
    path('admin/customers/', AdminCustomerListView.as_view(), name='admin-customer-list'),
]



