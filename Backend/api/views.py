import io
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import parse_csv, get_product_image_url
# Reportlab imports
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

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
        
        category_param = request.query_params.get('category', '').strip().lower()
        min_price_param = request.query_params.get('min_price')
        max_price_param = request.query_params.get('max_price')
        in_stock_param = request.query_params.get('in_stock')
        search_param = request.query_params.get('search') or request.query_params.get('q')
        ordering_param = request.query_params.get('ordering')
        
        products = []
        for p in raw_products:
            prod_id = int(p.get('Product ID', 0))
            prod_name = p.get('Product Name', '')
            cat_name = p.get('Category', '')
            brand_name = p.get('Brand', '')
            cat_slug = cat_name.lower().replace(' ', '-')
            
            try:
                price_val = float(p.get('Price (SGD)', '0.00') or 0.0)
            except ValueError:
                price_val = 0.0
                
            try:
                stock_val = int(p.get('Stock', 0) or 0)
            except ValueError:
                stock_val = 0

            # Category filter
            if category_param and category_param != 'all':
                if category_param != cat_slug and category_param != cat_name.lower():
                    continue

            # Price min filter
            if min_price_param is not None and min_price_param != '':
                try:
                    if price_val < float(min_price_param):
                        continue
                except ValueError:
                    pass

            # Price max filter
            if max_price_param is not None and max_price_param != '':
                try:
                    if price_val > float(max_price_param):
                        continue
                except ValueError:
                    pass

            # In stock filter
            if in_stock_param in ['true', '1', True]:
                if stock_val <= 0:
                    continue

            # Search filter
            if search_param:
                sp = search_param.lower()
                if sp not in prod_name.lower() and sp not in cat_name.lower() and sp not in brand_name.lower():
                    continue

            image_url = get_product_image_url(prod_name)
            
            # Formatted product
            formatted = {
                "id": prod_id,
                "name": prod_name,
                "slug": prod_name.lower().replace(' ', '-'),
                "sku": p.get('SKU', ''),
                "description": "",
                "category": {"id": 1, "name": cat_name, "slug": cat_slug},
                "brand": {"id": 1, "name": brand_name, "slug": brand_name.lower().replace(' ', '-')},
                "price": str(p.get('Price (SGD)', '0.00')),
                "thumbnail": image_url,
                "images": [{"id": 1, "image": image_url, "is_primary": True}],
                "stock": stock_val,
                "is_in_stock": stock_val > 0,
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
            
        # Ordering
        if ordering_param:
            if ordering_param == 'price':
                products.sort(key=lambda x: float(x['price']))
            elif ordering_param == '-price':
                products.sort(key=lambda x: float(x['price']), reverse=True)
            elif ordering_param == 'name':
                products.sort(key=lambda x: x['name'])
            elif ordering_param == '-name':
                products.sort(key=lambda x: x['name'], reverse=True)
            elif ordering_param in ['-stock', 'stock']:
                products.sort(key=lambda x: x['stock'], reverse=True)

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
            "first_name": "Lexicon",
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

class AuthMeView(APIView):
    def get(self, request):
        user = {
            "id": 1,
            "email": "user@example.com",
            "first_name": "Lexicon",
            "last_name": "User",
            "is_staff": False,
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

DEFAULT_SAMPLE_ORDERS = [
    {
        "id": 1001,
        "order_number": "ORD-2026-1001",
        "customer": {
            "id": 1,
            "email": "customer@example.com",
            "first_name": "Lexicon",
            "last_name": "Customer"
        },
        "items": [
            {
                "id": 1,
                "product": {"id": 101, "name": "Logitech MX Keys S Keyboard", "price": "189.00"},
                "quantity": 1,
                "unit_price": "189.00",
                "total_price": "189.00"
            }
        ],
        "status": "processing",
        "shipping_address": {
            "full_name": "Lexicon Customer",
            "phone": "+65 9123 4567",
            "address_line1": "123 Orchard Road, #05-10",
            "city": "Singapore",
            "postal_code": "238888",
            "country": "Singapore"
        },
        "subtotal": "189.00",
        "shipping_cost": "0.00",
        "tax": "0.00",
        "total": "189.00",
        "created_at": "2026-07-24T10:30:00Z",
        "updated_at": "2026-07-24T10:30:00Z"
    },
    {
        "id": 1002,
        "order_number": "ORD-2026-1002",
        "customer": {
            "id": 1,
            "email": "customer@example.com",
            "first_name": "Lexicon",
            "last_name": "Customer"
        },
        "items": [
            {
                "id": 1,
                "product": {"id": 104, "name": "Anker 12-in-1 USB-C Hub", "price": "108.00"},
                "quantity": 1,
                "unit_price": "108.00",
                "total_price": "108.00"
            }
        ],
        "status": "delivered",
        "shipping_address": {
            "full_name": "Lexicon Customer",
            "phone": "+65 9123 4567",
            "address_line1": "123 Orchard Road, #05-10",
            "city": "Singapore",
            "postal_code": "238888",
            "country": "Singapore"
        },
        "subtotal": "108.00",
        "shipping_cost": "0.00",
        "tax": "0.00",
        "total": "108.00",
        "created_at": "2026-07-20T14:15:00Z",
        "updated_at": "2026-07-22T09:00:00Z"
    }
]

class OrderCreateView(APIView):
    def get(self, request):
        user_orders = list(CREATED_ORDERS.values())
        all_orders = user_orders + DEFAULT_SAMPLE_ORDERS
        return Response({
            "count": len(all_orders),
            "next": None,
            "previous": None,
            "results": all_orders
        })

    def post(self, request):
        data = request.data or {}
        raw_items = data.get("items", [])
        
        products = parse_csv('products_template.csv')
        processed_items = []
        for idx, item in enumerate(raw_items):
            try:
                pid = int(item.get("product_id", 0))
            except (ValueError, TypeError):
                pid = 0
                
            p_obj = None
            if pid > 0:
                for p in products:
                    try:
                        if int(p.get('Product ID', 0) or 0) == pid:
                            p_obj = p
                            break
                    except (ValueError, TypeError):
                        pass

            p_name = p_obj.get('Product Name', f'Product #{pid}') if p_obj else f"Product #{pid}"
            raw_p_price = p_obj.get('Price (SGD)', '0.00') if p_obj else "0.00"
            clean_price_str = str(raw_p_price).replace('$', '').replace(',', '').strip()
            
            try:
                price_val = float(clean_price_str)
            except ValueError:
                price_val = 0.0

            try:
                qty = int(item.get("quantity", 1))
            except (ValueError, TypeError):
                qty = 1

            total_item_price = price_val * qty

            processed_items.append({
                "id": idx + 1,
                "product": {
                    "id": pid,
                    "name": p_name,
                    "price": f"{price_val:.2f}",
                    "thumbnail": get_product_image_url(p_name),
                },
                "quantity": qty,
                "unit_price": f"{price_val:.2f}",
                "total_price": f"{total_item_price:.2f}",
            })
            
        if not processed_items:
            processed_items = [
                {
                    "id": 1,
                    "product": {"id": 101, "name": "Logitech MX Keys S Keyboard", "price": "189.00"},
                    "quantity": 1,
                    "unit_price": "189.00",
                    "total_price": "189.00"
                }
            ]

        total_order_price = sum(float(it["total_price"]) for it in processed_items) if processed_items else 0.0
        shipping_fee = 0.0 if total_order_price >= 80.0 else 5.99
        grand_total = total_order_price + shipping_fee

        order_number = f"ORD-2026-{1001 + len(CREATED_ORDERS)}"
        order = {
            "id": 1001 + len(CREATED_ORDERS),
            "order_number": order_number,
            "customer": {
                "id": 1,
                "email": str(data.get("customer_email", "customer@example.com")),
                "first_name": str(data.get("customer_name", "Test User")),
                "last_name": "",
                "is_staff": False,
                "is_active": True,
                "date_joined": "2026-01-01T00:00:00Z"
            },
            "items": processed_items,
            "status": "confirmed",
            "shipping_address": data.get("shipping_address") or {
                "id": 1,
                "label": "Home",
                "full_name": str(data.get("customer_name", "Test User")),
                "phone": str(data.get("customer_phone", "+65 1234 5678")),
                "address_line1": "123 Tech Park",
                "city": "Singapore",
                "state": "SG",
                "postal_code": "123456",
                "country": "Singapore",
                "is_default": True
            },
            "subtotal": f"{total_order_price:.2f}",
            "shipping_cost": f"{shipping_fee:.2f}",
            "tax": "0.00",
            "total": f"{grand_total:.2f}",
            "created_at": "2026-07-24T12:00:00Z",
            "updated_at": "2026-07-24T12:00:00Z"
        }
        CREATED_ORDERS[order_number] = order
        return Response(order)

class OrderDetailView(APIView):
    def get(self, request, order_number):
        if order_number in CREATED_ORDERS:
            return Response(CREATED_ORDERS[order_number])
            
        sample_match = next((o for o in DEFAULT_SAMPLE_ORDERS if o['order_number'] == order_number), None)
        if sample_match:
            return Response(sample_match)
            
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

class OrderInvoiceView(APIView):
    def get(self, request, order_number):
        order = None
        if order_number in CREATED_ORDERS:
            order = CREATED_ORDERS[order_number]
        else:
            sample_match = next((o for o in DEFAULT_SAMPLE_ORDERS if o['order_number'] == order_number), None)
            if sample_match:
                order = sample_match
            else:
                order = {
                    "id": 1001,
                    "order_number": order_number,
                    "customer": {
                        "id": 1,
                        "email": "customer@example.com",
                        "first_name": "Lexicon",
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
                        }
                    ],
                    "status": "confirmed",
                    "shipping_address": {
                        "id": 1,
                        "label": "Home",
                        "full_name": "Lexicon User",
                        "phone": "+65 1234 5678",
                        "address_line1": "123 Tech Park",
                        "city": "Singapore",
                        "state": "SG",
                        "postal_code": "123456",
                        "country": "Singapore",
                        "is_default": True
                    },
                    "subtotal": "189.00",
                    "shipping_cost": "0.00",
                    "tax": "0.00",
                    "total": "189.00",
                    "created_at": "2026-07-22T12:00:00Z",
                    "updated_at": "2026-07-22T12:00:00Z"
                }

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'InvoiceTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=12
        )

        header_style = ParagraphStyle(
            'InvoiceHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=12,
            textColor=colors.HexColor("#475569")
        )

        normal_style = ParagraphStyle(
            'InvoiceNormal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155")
        )

        bold_style = ParagraphStyle(
            'InvoiceBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#0f172a")
        )

        shipping_addr = order.get("shipping_address") or {}
        customer = order.get("customer") or {}

        header_data = [
            [
                Paragraph("<b>LEXICON TECHNOLOGY</b><br/>123 Tech Center, #05-01<br/>Singapore 123456<br/>Email: info@lexicon.sg", normal_style),
                Paragraph(f"<b>INVOICE</b><br/>Invoice No: INV-{order['order_number']}<br/>Date: {order['created_at'][:10]}<br/>Status: {order['status'].upper()}", normal_style)
            ]
        ]

        header_table = Table(header_data, colWidths=[270, 270])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('ALIGN', (1,0), (1,0), 'RIGHT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 20),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 10))

        bill_ship_data = [
            [
                Paragraph("<b>Bill To:</b>", header_style),
                Paragraph("<b>Ship To:</b>", header_style)
            ],
            [
                Paragraph(f"{customer.get('first_name', '')} {customer.get('last_name', '')}<br/>Email: {customer.get('email', '')}", normal_style),
                Paragraph(f"{shipping_addr.get('full_name', 'Customer')}<br/>{shipping_addr.get('address_line1', '')}<br/>{shipping_addr.get('city', '')} {shipping_addr.get('postal_code', '')}<br/>Phone: {shipping_addr.get('phone', '')}", normal_style)
            ]
        ]
        bill_ship_table = Table(bill_ship_data, colWidths=[270, 270])
        bill_ship_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        elements.append(bill_ship_table)
        elements.append(Spacer(1, 20))

        items_data = [
            [
                Paragraph("<b>Product</b>", bold_style),
                Paragraph("<b>Qty</b>", bold_style),
                Paragraph("<b>Unit Price (SGD)</b>", bold_style),
                Paragraph("<b>Total (SGD)</b>", bold_style)
            ]
        ]

        for item in order.get("items", []):
            product_name = item.get("product", {}).get("name", "Product")
            unit_price = item.get("unit_price", "0.00")
            qty = item.get("quantity", 1)
            total_price = item.get("total_price", "0.00")

            items_data.append([
                Paragraph(product_name, normal_style),
                Paragraph(str(qty), normal_style),
                Paragraph(f"${float(unit_price):.2f}", normal_style),
                Paragraph(f"${float(total_price):.2f}", normal_style)
            ])

        subtotal = order.get("subtotal", "0.00")
        shipping = order.get("shipping_cost", "0.00")
        total = order.get("total", "0.00")

        items_data.append([Paragraph("", normal_style), Paragraph("", normal_style), Paragraph("<b>Subtotal:</b>", normal_style), Paragraph(f"${float(subtotal):.2f}", normal_style)])
        items_data.append([Paragraph("", normal_style), Paragraph("", normal_style), Paragraph("<b>Shipping:</b>", normal_style), Paragraph("FREE" if float(shipping) == 0 else f"${float(shipping):.2f}", normal_style)])
        items_data.append([Paragraph("", normal_style), Paragraph("", normal_style), Paragraph("<b>Total:</b>", bold_style), Paragraph(f"${float(total):.2f}", bold_style)])

        items_table = Table(items_data, colWidths=[280, 50, 100, 110])
        items_table_style = [
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor("#cbd5e1")),
            ('LINEBELOW', (0,1), (-1,-4), 0.5, colors.HexColor("#e2e8f0")),
            ('LINEBELOW', (2,-3), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]

        items_table.setStyle(TableStyle(items_table_style))
        elements.append(items_table)
        elements.append(Spacer(1, 30))

        elements.append(Paragraph("<para align=center>Thank you for shopping with Lexicon Technology!</para>", bold_style))

        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"invoice-{order_number}.pdf", content_type='application/pdf')

SAVED_ADDRESSES = [
    {
        "id": 1,
        "label": "Home",
        "full_name": "Lexicon User",
        "phone": "+65 9123 4567",
        "address_line1": "123 Tech Park",
        "address_line2": "#05-10",
        "city": "Singapore",
        "state": "Singapore",
        "postal_code": "123456",
        "country": "Singapore",
        "is_default": True
    }
]

class AddressListView(APIView):
    def get(self, request):
        return Response(SAVED_ADDRESSES)
        
    def post(self, request):
        data = request.data or {}
        new_id = max([a['id'] for a in SAVED_ADDRESSES]) + 1 if SAVED_ADDRESSES else 1
        
        is_default = data.get("is_default", False)
        if is_default:
            for addr in SAVED_ADDRESSES:
                addr['is_default'] = False
                
        new_address = {
            "id": new_id,
            "label": data.get("label", "Home"),
            "full_name": data.get("full_name", ""),
            "phone": data.get("phone", ""),
            "address_line1": data.get("address_line1", ""),
            "address_line2": data.get("address_line2", ""),
            "city": data.get("city", ""),
            "state": data.get("state", ""),
            "postal_code": data.get("postal_code", ""),
            "country": data.get("country", ""),
            "is_default": is_default
        }
        SAVED_ADDRESSES.append(new_address)
        return Response(new_address, status=201)

class AddressDetailView(APIView):
    def patch(self, request, pk):
        data = request.data or {}
        addr = next((a for a in SAVED_ADDRESSES if a['id'] == int(pk)), None)
        if not addr:
            return Response({"error": "Address not found"}, status=404)
            
        is_default = data.get("is_default", addr['is_default'])
        if is_default and not addr['is_default']:
            for a in SAVED_ADDRESSES:
                a['is_default'] = False
                
        addr['label'] = data.get("label", addr['label'])
        addr['full_name'] = data.get("full_name", addr['full_name'])
        addr['phone'] = data.get("phone", addr['phone'])
        addr['address_line1'] = data.get("address_line1", addr['address_line1'])
        addr['address_line2'] = data.get("address_line2", addr['address_line2'])
        addr['city'] = data.get("city", addr['city'])
        addr['state'] = data.get("state", addr['state'])
        addr['postal_code'] = data.get("postal_code", addr['postal_code'])
        addr['country'] = data.get("country", addr['country'])
        addr['is_default'] = is_default
        
        return Response(addr)
        
    def delete(self, request, pk):
        global SAVED_ADDRESSES
        addr = next((a for a in SAVED_ADDRESSES if a['id'] == int(pk)), None)
        if not addr:
            return Response({"error": "Address not found"}, status=404)
            
        SAVED_ADDRESSES = [a for a in SAVED_ADDRESSES if a['id'] != int(pk)]
        
        if addr['is_default'] and SAVED_ADDRESSES:
            SAVED_ADDRESSES[0]['is_default'] = True
            
        return Response({"message": "Address deleted successfully"})

class AddressSetDefaultView(APIView):
    def post(self, request, pk):
        addr = next((a for a in SAVED_ADDRESSES if a['id'] == int(pk)), None)
        if not addr:
            return Response({"error": "Address not found"}, status=404)
            
        for a in SAVED_ADDRESSES:
            a['is_default'] = (a['id'] == int(pk))
            
        return Response(addr)

