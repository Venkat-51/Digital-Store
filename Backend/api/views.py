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
            
            # Formatted product
            formatted = {
                "id": prod_id,
                "name": p.get('Product Name', ''),
                "slug": p.get('Product Name', '').lower().replace(' ', '-'),
                "sku": p.get('SKU', ''),
                "description": "",
                "category": {"id": 1, "name": p.get('Category', ''), "slug": p.get('Category', '').lower().replace(' ', '-')},
                "brand": {"id": 1, "name": p.get('Brand', ''), "slug": p.get('Brand', '').lower().replace(' ', '-')},
                "price": p.get('Price (SGD)', '0.00'),
                "images": [],
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
                
                # Format product exactly like ListView does
                formatted = {
                    "id": prod_id,
                    "name": p.get('Product Name', ''),
                    "slug": p_slug,
                    "sku": p.get('SKU', ''),
                    "description": p.get('Description', ''),
                    "category": {"id": 1, "name": p.get('Category', ''), "slug": p.get('Category', '').lower().replace(' ', '-')},
                    "brand": {"id": 1, "name": p.get('Brand', ''), "slug": p.get('Brand', '').lower().replace(' ', '-')},
                    "price": p.get('Price (SGD)', '0.00'),
                    "images": [],
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
            "is_staff": False,
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
            "first_name": "Test",
            "last_name": "User",
            "is_staff": False,
            "is_active": True,
            "date_joined": "2026-01-01T00:00:00Z"
        }
        tokens = {
            "access": "mock_access_token",
            "refresh": "mock_refresh_token"
        }
        return Response({"tokens": tokens, "user": user})

class OrderCreateView(APIView):
    def post(self, request):
        order = {
            "id": 1001,
            "order_number": "ORD-2026-1001",
            "customer": {
                "id": 1,
                "email": "customer@example.com",
                "first_name": "Test",
                "last_name": "User",
                "is_staff": False,
                "is_active": True,
                "date_joined": "2026-01-01T00:00:00Z"
            },
            "items": [],
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
            "subtotal": "0.00",
            "shipping_cost": "0.00",
            "tax": "0.00",
            "total": "297.00",
            "created_at": "2026-07-20T18:00:00Z",
            "updated_at": "2026-07-20T18:00:00Z"
        }
        return Response(order)
