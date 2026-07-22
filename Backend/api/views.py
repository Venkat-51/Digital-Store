from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import parse_csv, get_product_image_url

class CategoryListView(APIView):
    def get(self, request):
        raw_categories = parse_csv('categories.csv')
        categories = []
        for c in raw_categories:
            categories.append({
                "id": int(c.get('Category ID', 0)),
                "name": c.get('Category Name', ''),
                "slug": c.get('Category Name', '').lower().replace(' ', '-'),
                "description": c.get('Description', ''),
            })
        return Response(categories)

class ProductListView(APIView):
    def get(self, request):
        raw_products = parse_csv('products_template.csv')
        specs = parse_csv('specifications_template.csv')
        
        products = []
        for p in raw_products:
            prod_id = int(p.get('Product ID', 0))
            prod_name = p.get('Product Name', '')
            image_url = get_product_image_url(prod_name)
            
            # Formatted product
            formatted = {
                "id": prod_id,
                "name": prod_name,
                "slug": prod_name.lower().replace(' ', '-'),
                "sku": p.get('SKU', ''),
                "description": "",
                "category": {"id": 1, "name": p.get('Category', ''), "slug": p.get('Category', '').lower().replace(' ', '-')},
                "brand": {"id": 1, "name": p.get('Brand', ''), "slug": p.get('Brand', '').lower().replace(' ', '-')},
                "price": p.get('Price (SGD)', '0.00'),
                "thumbnail": image_url,
                "images": [{"id": 1, "image": image_url, "is_primary": True}],
                "stock": int(p.get('Stock', 0) or 0),
                "is_in_stock": int(p.get('Stock', 0) or 0) > 0,
                "is_featured": False,
                "is_new": True,
                "is_sale": False,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z",
                "specifications": [
                    {"id": idx, "name": s.get('Specification Name'), "value": s.get('Specification Value')}
                    for idx, s in enumerate(specs) if s.get('Product ID') == p.get('Product ID')
                ]
            }
            products.append(formatted)
            
        # Handle pagination
        try:
            page_size = int(request.query_params.get('page_size', 0))
        except (ValueError, TypeError):
            page_size = 0

        try:
            page = int(request.query_params.get('page', 1))
        except (ValueError, TypeError):
            page = 1

        if page_size > 0:
            start = (page - 1) * page_size
            end = start + page_size
            paginated_products = products[start:end]
        else:
            paginated_products = products

        response_data = {
            "count": len(products),
            "next": None,
            "previous": None,
            "results": paginated_products
        }
        return Response(response_data)

class ProductDetailView(APIView):
    def get(self, request, slug):
        raw_products = parse_csv('products_template.csv')
        specs = parse_csv('specifications_template.csv')
        
        for p in raw_products:
            p_slug = p.get('Product Name', '').lower().replace(' ', '-')
            if p_slug == slug:
                prod_id = int(p.get('Product ID', 0))
                prod_name = p.get('Product Name', '')
                image_url = get_product_image_url(prod_name)
                
                # Format product exactly like ListView does
                formatted = {
                    "id": prod_id,
                    "name": prod_name,
                    "slug": p_slug,
                    "sku": p.get('SKU', ''),
                    "description": p.get('Description', ''),
                    "category": {"id": 1, "name": p.get('Category', ''), "slug": p.get('Category', '').lower().replace(' ', '-')},
                    "brand": {"id": 1, "name": p.get('Brand', ''), "slug": p.get('Brand', '').lower().replace(' ', '-')},
                    "price": p.get('Price (SGD)', '0.00'),
                    "thumbnail": image_url,
                    "images": [{"id": 1, "image": image_url, "is_primary": True}],
                    "stock": int(p.get('Stock', 0) or 0),
                    "is_in_stock": int(p.get('Stock', 0) or 0) > 0,
                    "is_featured": False,
                    "is_new": True,
                    "is_sale": False,
                    "created_at": "2026-01-01T00:00:00Z",
                    "updated_at": "2026-01-01T00:00:00Z",
                    "specifications": [
                        {"id": idx, "name": s.get('Specification Name'), "value": s.get('Specification Value')}
                        for idx, s in enumerate(specs) if int(s.get('Product ID', 0)) == prod_id
                    ]
                }
                return Response(formatted)
        
        return Response({'error': 'Product not found'}, status=404)

class ProductImageView(APIView):
    def get(self, request, product_id):
        products = parse_csv('products_template.csv')
        product = next((p for p in products if int(p.get('Product ID', 0)) == product_id), None)
        
        if not product:
            return Response({'error': 'Product not found'}, status=404)
            
        product_name = product.get('Product Name')
        if not product_name:
            return Response({'error': 'Product has no name'}, status=400)
            
        image_url = get_product_image_url(product_name)
        return Response({'image_url': image_url})

class AuthRegisterView(APIView):
    def post(self, request):
        data = request.data
        user = {
            "id": 1,
            "email": data.get("email", ""),
            "first_name": data.get("first_name", ""),
            "last_name": data.get("last_name", ""),
            "is_staff": True,
            "is_active": True,
            "date_joined": "2026-01-01T00:00:00Z"
        }
        tokens = {
            "access": "mock_access_token",
            "refresh": "mock_refresh_token"
        }
        return Response({"tokens": tokens, "user": user})

class AuthLoginView(APIView):
    def post(self, request):
        data = request.data
        user = {
            "id": 1,
            "email": data.get("email", ""),
            "first_name": "Admin",
            "last_name": "User",
            "is_staff": True,
            "is_active": True,
            "date_joined": "2026-01-01T00:00:00Z"
        }
        tokens = {
            "access": "mock_access_token",
            "refresh": "mock_refresh_token"
        }
        return Response({"tokens": tokens, "user": user})

class AuthMeView(APIView):
    def get(self, request):
        user = {
            "id": 1,
            "email": "admin@example.com",
            "first_name": "Admin",
            "last_name": "User",
            "is_staff": True,
            "is_active": True,
            "date_joined": "2026-01-01T00:00:00Z"
        }
        return Response(user)

class AuthLogoutView(APIView):
    def post(self, request):
        return Response({"message": "Logged out successfully"})

class AuthPasswordResetView(APIView):
    def post(self, request):
        return Response({"message": "Password reset email sent"})

class AuthPasswordResetConfirmView(APIView):
    def post(self, request):
        return Response({"message": "Password reset successfully"})

class AuthTokenRefreshView(APIView):
    def post(self, request):
        return Response({"access": "mock_access_token"})

class ProductFeaturedView(APIView):
    def get(self, request):
        raw_products = parse_csv('products_template.csv')
        products = []
        for p in raw_products[:4]:
            prod_id = int(p.get('Product ID', 0))
            prod_name = p.get('Product Name', '')
            image_url = get_product_image_url(prod_name)
            formatted = {
                "id": prod_id,
                "name": prod_name,
                "slug": prod_name.lower().replace(' ', '-'),
                "sku": p.get('SKU', ''),
                "description": "",
                "category": {"id": 1, "name": p.get('Category', ''), "slug": p.get('Category', '').lower().replace(' ', '-')},
                "brand": {"id": 1, "name": p.get('Brand', ''), "slug": p.get('Brand', '').lower().replace(' ', '-')},
                "price": p.get('Price (SGD)', '0.00'),
                "thumbnail": image_url,
                "images": [{"id": 1, "image": image_url, "is_primary": True}],
                "stock": int(p.get('Stock', 0) or 0),
                "is_in_stock": int(p.get('Stock', 0) or 0) > 0,
                "is_featured": True,
                "is_new": True,
                "is_sale": False,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z",
                "specifications": []
            }
            products.append(formatted)
        return Response(products)

class ProductRelatedView(APIView):
    def get(self, request, product_id):
        raw_products = parse_csv('products_template.csv')
        products = []
        for p in raw_products:
            prod_id = int(p.get('Product ID', 0))
            if prod_id == product_id:
                continue
            prod_name = p.get('Product Name', '')
            image_url = get_product_image_url(prod_name)
            formatted = {
                "id": prod_id,
                "name": prod_name,
                "slug": prod_name.lower().replace(' ', '-'),
                "sku": p.get('SKU', ''),
                "description": "",
                "category": {"id": 1, "name": p.get('Category', ''), "slug": p.get('Category', '').lower().replace(' ', '-')},
                "brand": {"id": 1, "name": p.get('Brand', ''), "slug": p.get('Brand', '').lower().replace(' ', '-')},
                "price": p.get('Price (SGD)', '0.00'),
                "thumbnail": image_url,
                "images": [{"id": 1, "image": image_url, "is_primary": True}],
                "stock": int(p.get('Stock', 0) or 0),
                "is_in_stock": int(p.get('Stock', 0) or 0) > 0,
                "is_featured": False,
                "is_new": True,
                "is_sale": False,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z",
                "specifications": []
            }
            products.append(formatted)
            if len(products) >= 4:
                break
        return Response(products)

CREATED_ORDERS = {}

class OrderCreateView(APIView):
    def post(self, request):
        data = request.data or {}
        raw_items = data.get("items", [])
        
        products = parse_csv('products_template.csv')
        processed_items = []
        for idx, item in enumerate(raw_items):
            pid = int(item.get("product_id", 0))
            p_obj = next((p for p in products if int(p.get('Product ID', 0)) == pid), None)
            p_name = p_obj.get('Product Name', f'Product #{pid}') if p_obj else f"Product #{pid}"
            p_price = p_obj.get('Price (SGD)', '0.00') if p_obj else "0.00"
            qty = int(item.get("quantity", 1))
            
            processed_items.append({
                "id": idx + 1,
                "product": {
                    "id": pid,
                    "name": p_name,
                    "price": p_price,
                    "thumbnail": get_product_image_url(p_name),
                },
                "quantity": qty,
                "unit_price": p_price,
                "total_price": f"{float(p_price) * qty:.2f}",
            })
            
        if not processed_items:
            processed_items = [
                {
                    "id": 1,
                    "product": {"id": 101, "name": "Logitech MX Keys S Keyboard", "price": "189.00"},
                    "quantity": 1,
                    "unit_price": "189.00",
                    "total_price": "189.00"
                },
                {
                    "id": 2,
                    "product": {"id": 104, "name": "Anker 12-in-1 USB-C Hub", "price": "108.00"},
                    "quantity": 1,
                    "unit_price": "108.00",
                    "total_price": "108.00"
                }
            ]

        order_number = f"ORD-2026-{1001 + len(CREATED_ORDERS)}"
        order = {
            "id": 1001 + len(CREATED_ORDERS),
            "order_number": order_number,
            "customer": {
                "id": 1,
                "email": data.get("customer_email", "customer@example.com"),
                "first_name": data.get("customer_name", "Test User"),
                "last_name": "",
                "is_staff": False,
                "is_active": True,
                "date_joined": "2026-01-01T00:00:00Z"
            },
            "items": processed_items,
            "status": "confirmed",
            "shipping_address": data.get("shipping_address", {
                "id": 1,
                "label": "Home",
                "full_name": data.get("customer_name", "Test User"),
                "phone": data.get("customer_phone", "+65 1234 5678"),
                "address_line1": "123 Tech Park",
                "city": "Singapore",
                "state": "SG",
                "postal_code": "123456",
                "country": "Singapore",
                "is_default": True
            }),
            "subtotal": data.get("subtotal", "297.00"),
            "shipping_cost": "0.00",
            "tax": "0.00",
            "total": data.get("total", "297.00"),
            "created_at": "2026-07-22T12:00:00Z",
            "updated_at": "2026-07-22T12:00:00Z"
        }
        CREATED_ORDERS[order_number] = order
        return Response(order)

class OrderDetailView(APIView):
    def get(self, request, order_number):
        if order_number in CREATED_ORDERS:
            return Response(CREATED_ORDERS[order_number])
            
        order = {
            "id": 1001,
            "order_number": order_number,
            "customer": {
                "id": 1,
                "email": "customer@example.com",
                "first_name": "Test",
                "last_name": "User",
                "is_staff": False,
                "is_active": True,
                "date_joined": "2026-01-01T00:00:00Z"
            },
            "items": [
                {
                    "id": 1,
                    "product": {"id": 101, "name": "Logitech MX Keys S Keyboard", "price": "189.00"},
                    "quantity": 1,
                    "unit_price": "189.00",
                    "total_price": "189.00"
                },
                {
                    "id": 2,
                    "product": {"id": 104, "name": "Anker 12-in-1 USB-C Hub", "price": "108.00"},
                    "quantity": 1,
                    "unit_price": "108.00",
                    "total_price": "108.00"
                }
            ],
            "status": "confirmed",
            "shipping_address": {
                "id": 1,
                "label": "Home",
                "full_name": "Test User",
                "phone": "+65 1234 5678",
                "address_line1": "123 Tech Park",
                "city": "Singapore",
                "state": "SG",
                "postal_code": "123456",
                "country": "Singapore",
                "is_default": True
            },
            "subtotal": "297.00",
            "shipping_cost": "0.00",
            "tax": "0.00",
            "total": "297.00",
            "created_at": "2026-07-22T12:00:00Z",
            "updated_at": "2026-07-22T12:00:00Z"
        }
        return Response(order)

