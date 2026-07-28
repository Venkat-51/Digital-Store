import io
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.contrib.auth.models import User
from django.core.management import call_command

# Reportlab imports
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from .models import (
    Category, Brand, Product, ProductImage, Specification,
    UserProfile, Address, Order, OrderItem, WishlistItem
)
from .serializers import (
    CategorySerializer, ProductSerializer, AddressSerializer,
    OrderSerializer, UserSerializer
)

def ensure_database_seeded():
    """Auto-seed Neon database if empty."""
    try:
        from django.db import connection
        tables = connection.introspection.table_names()
        if 'api_category' in tables and 'api_product' in tables:
            if Category.objects.count() == 0 or Product.objects.count() == 0:
                call_command('seed_data')
    except Exception as e:
        print(f"Auto-seed exception: {e}")

class CategoryListView(APIView):
    def get(self, request):
        try:
            ensure_database_seeded()
            categories = Category.objects.all()
            serializer = CategorySerializer(categories, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"CategoryListView Error: {e}")
            return Response([])

class ProductListView(APIView):
    def get(self, request):
        try:
            ensure_database_seeded()
        except Exception:
            pass

        try:
            queryset = Product.objects.select_related('category', 'brand').prefetch_related('images', 'specifications').all()

            category_param = request.query_params.get('category', '').strip().lower()
            min_price_param = request.query_params.get('min_price')
            max_price_param = request.query_params.get('max_price')
            in_stock_param = request.query_params.get('in_stock')
            search_param = request.query_params.get('search') or request.query_params.get('q')
            ordering_param = request.query_params.get('ordering')

            if category_param and category_param != 'all':
                queryset = queryset.filter(Q(category__slug=category_param) | Q(category__name__iexact=category_param))

            if min_price_param:
                try:
                    queryset = queryset.filter(price__gte=float(min_price_param))
                except ValueError:
                    pass

            if max_price_param:
                try:
                    queryset = queryset.filter(price__lte=float(max_price_param))
                except ValueError:
                    pass

            if in_stock_param in ['true', '1', True]:
                queryset = queryset.filter(stock__gt=0)

            if search_param:
                sp = search_param.strip()
                queryset = queryset.filter(
                    Q(name__icontains=sp) |
                    Q(category__name__icontains=sp) |
                    Q(brand__name__icontains=sp) |
                    Q(description__icontains=sp)
                )

            if ordering_param:
                if ordering_param in ['price', '-price', 'name', '-name', 'stock', '-stock']:
                    queryset = queryset.order_by(ordering_param)
            else:
                queryset = queryset.order_by('id')

            try:
                page_size = int(request.query_params.get('page_size', 0))
            except (ValueError, TypeError):
                page_size = 0

            try:
                page = int(request.query_params.get('page', 1))
            except (ValueError, TypeError):
                page = 1

            total_count = queryset.count()

            if page_size > 0:
                start = (page - 1) * page_size
                end = start + page_size
                paginated_qs = queryset[start:end]
            else:
                paginated_qs = queryset

            serializer = ProductSerializer(paginated_qs, many=True)

            return Response({
                "count": total_count,
                "next": None,
                "previous": None,
                "results": serializer.data
            })
        except Exception as e:
            print(f"ProductListView Error: {e}")
            return Response({
                "count": 0,
                "next": None,
                "previous": None,
                "results": []
            })

class ProductDetailView(APIView):
    def get(self, request, slug):
        ensure_database_seeded()
        product = Product.objects.filter(slug__iexact=slug).first()
        if not product:
            return Response({'error': 'Product not found'}, status=404)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

class ProductImageView(APIView):
    def get(self, request, product_id):
        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({'error': 'Product not found'}, status=404)
        return Response({'image_url': product.thumbnail})

class ProductFeaturedView(APIView):
    def get(self, request):
        try:
            try:
                ensure_database_seeded()
            except Exception:
                pass

            featured = Product.objects.filter(is_featured=True)[:4]
            if not featured.exists():
                featured = Product.objects.all()[:4]
            serializer = ProductSerializer(featured, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"ProductFeaturedView Error: {e}")
            return Response([])

class ProductRelatedView(APIView):
    def get(self, request, product_id):
        try:
            try:
                ensure_database_seeded()
            except Exception:
                pass

            product = Product.objects.filter(id=product_id).first()
            if product and product.category:
                related = Product.objects.filter(category=product.category).exclude(id=product_id)[:4]
            else:
                related = Product.objects.exclude(id=product_id)[:4]
            serializer = ProductSerializer(related, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"ProductRelatedView Error: {e}")
            return Response([])

class AuthRegisterView(APIView):
    def post(self, request):
        data = request.data or {}
        email = data.get("email", "user@example.com").strip()
        first_name = data.get("first_name", "Lexicon").strip()
        last_name = data.get("last_name", "User").strip()
        phone = data.get("phone", "+65 9123 4567").strip()

        username = email.split('@')[0] if email else "user"
        user, _ = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "first_name": first_name, "last_name": last_name}
        )
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone = phone
        profile.save()

        serializer = UserSerializer(user)
        tokens = {"access": "mock_access_token", "refresh": "mock_refresh_token"}
        return Response({"tokens": tokens, "user": serializer.data})

class AuthLoginView(APIView):
    def post(self, request):
        data = request.data or {}
        email = data.get("email", "guru@gmail.com").strip()

        user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email.split('@')[0])).first()
        if not user:
            user = User.objects.create(
                username=email.split('@')[0],
                email=email,
                first_name="guru",
                last_name="k"
            )
            UserProfile.objects.create(user=user, phone="+65 9123 4567")

        serializer = UserSerializer(user)
        tokens = {"access": "mock_access_token", "refresh": "mock_refresh_token"}
        return Response({"tokens": tokens, "user": serializer.data})

class AuthMeView(APIView):
    def get(self, request):
        user = User.objects.filter(username="guru").first() or User.objects.first()
        if not user:
            user = User.objects.create(username="guru", email="guru@gmail.com", first_name="guru", last_name="k")
            UserProfile.objects.create(user=user, phone="+65 9123 4567")

        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        data = request.data or {}
        user = User.objects.filter(username="guru").first() or User.objects.first()
        if not user:
            return Response({"error": "User not found"}, status=404)

        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "email" in data:
            user.email = data["email"]
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if "phone" in data:
            profile.phone = data["phone"]
            profile.save()

        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        return self.patch(request)

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

class AuthGoogleView(APIView):
    def post(self, request):
        data = request.data or {}
        id_token = data.get("idToken") or data.get("credential") or data.get("token") or ""

        email = "google.user@example.com"
        first_name = "Google"
        last_name = "User"
        phone = "+65 9123 4567"
        avatar = ""

        if id_token:
            try:
                import json, base64
                parts = id_token.split('.')
                if len(parts) >= 2:
                    payload_b64 = parts[1]
                    payload_b64 += '=' * (-len(payload_b64) % 4)
                    payload_bytes = base64.b64decode(payload_b64)
                    payload = json.loads(payload_bytes.decode('utf-8'))

                    email = payload.get("email", email)
                    name_str = payload.get("name", "")
                    name_parts = name_str.split() if name_str else []

                    first_name = payload.get("given_name") or (name_parts[0] if name_parts else "Google")
                    last_name = payload.get("family_name") or (" ".join(name_parts[1:]) if len(name_parts) > 1 else "")
                    avatar = payload.get("picture", "")
            except Exception as e:
                print(f"Error decoding Google ID token: {e}")

        username = email.split('@')[0] if email else "googleuser"
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "first_name": first_name, "last_name": last_name}
        )
        if not created:
            user.email = email
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if avatar:
            profile.avatar = avatar
        if not profile.phone:
            profile.phone = phone
        profile.save()

        serializer = UserSerializer(user)
        tokens = {
            "access": "mock_access_token",
            "refresh": "mock_refresh_token"
        }
        return Response({
            "tokens": tokens,
            "token": "mock_access_token",
            "user": serializer.data
        })

class OrderCreateView(APIView):
    def get(self, request):
        ensure_database_seeded()
        status_param = request.query_params.get('status')
        queryset = Order.objects.prefetch_related('items', 'items__product').all().order_by('-created_at')

        if status_param and status_param != 'all':
            queryset = queryset.filter(status__iexact=status_param)

        serializer = OrderSerializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "next": None,
            "previous": None,
            "results": serializer.data
        })

    def post(self, request):
        ensure_database_seeded()
        data = request.data or {}
        raw_items = data.get("items", [])

        c_name = str(data.get("customer_name") or "guru k")
        c_email = str(data.get("customer_email") or "guru@gmail.com")
        c_phone = str(data.get("customer_phone") or "+65 9123 4567")

        shipping_addr = data.get("shipping_address")
        if not shipping_addr and data.get("shipping_address_id"):
            addr_obj = Address.objects.filter(id=data["shipping_address_id"]).first()
            if addr_obj:
                shipping_addr = {
                    "full_name": addr_obj.full_name,
                    "phone": addr_obj.phone,
                    "address_line1": addr_obj.address_line1,
                    "address_line2": addr_obj.address_line2,
                    "city": addr_obj.city,
                    "state": addr_obj.state,
                    "postal_code": addr_obj.postal_code,
                    "country": addr_obj.country
                }

        if not shipping_addr:
            shipping_addr = {
                "full_name": c_name,
                "phone": c_phone,
                "address_line1": "123 Orchard Road, #05-10",
                "city": "Singapore",
                "postal_code": "238888",
                "country": "Singapore"
            }

        user = User.objects.filter(username="guru").first() or User.objects.first()

        import time, random
        unique_suffix = int(time.time() * 100) % 90000 + 10000
        order_number = f"ORD-2026-{unique_suffix}"

        order = Order.objects.create(
            order_number=order_number,
            user=user,
            customer_name=c_name,
            customer_email=c_email,
            customer_phone=c_phone,
            shipping_address=shipping_addr,
            status="confirmed"
        )

        subtotal = 0.0
        for item_data in raw_items:
            try:
                pid = int(item_data.get("product_id", 0))
            except (ValueError, TypeError):
                pid = 0

            prod_obj = Product.objects.filter(id=pid).first()
            p_name = item_data.get("product_name") or (prod_obj.name if prod_obj else f"Product #{pid}")
            
            try:
                p_price = float(item_data.get("unit_price") or (prod_obj.price if prod_obj else 0.0))
            except (ValueError, TypeError):
                p_price = float(prod_obj.price) if prod_obj else 0.0

            try:
                qty = int(item_data.get("quantity", 1))
            except (ValueError, TypeError):
                qty = 1

            total_item_price = p_price * qty
            subtotal += total_item_price

            OrderItem.objects.create(
                order=order,
                product=prod_obj,
                product_name=p_name,
                unit_price=p_price,
                quantity=qty,
                total_price=total_item_price
            )

        shipping_fee = 0.0 if subtotal >= 80.0 else 5.99
        grand_total = subtotal + shipping_fee

        order.subtotal = subtotal
        order.shipping_cost = shipping_fee
        order.total = grand_total
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrderDetailView(APIView):
    def get(self, request, order_number=None, pk=None):
        ensure_database_seeded()
        target = order_number or pk
        order = Order.objects.filter(order_number__iexact=str(target)).first()
        if not order and str(target).isdigit():
            order = Order.objects.filter(id=int(target)).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def patch(self, request, order_number=None, pk=None):
        ensure_database_seeded()
        target = order_number or pk
        order = Order.objects.filter(order_number__iexact=str(target)).first()
        if not order and str(target).isdigit():
            order = Order.objects.filter(id=int(target)).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        data = request.data or {}
        if "status" in data:
            order.status = data["status"]
            order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data)

class OrderCancelView(APIView):
    def post(self, request, order_number=None, pk=None):
        ensure_database_seeded()
        target = order_number or pk
        order = Order.objects.filter(order_number__iexact=str(target)).first()
        if not order and str(target).isdigit():
            order = Order.objects.filter(id=int(target)).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        order.status = "cancelled"
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data)

class OrderInvoiceView(APIView):
    def get(self, request, order_number=None, pk=None):
        ensure_database_seeded()
        target = order_number or pk
        order = Order.objects.filter(order_number__iexact=str(target)).first()
        if not order and str(target).isdigit():
            order = Order.objects.filter(id=int(target)).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        serializer = OrderSerializer(order)
        order_dict = serializer.data

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

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

        shipping_addr = order_dict.get("shipping_address") or {}
        customer = order_dict.get("customer") or {}

        header_data = [
            [
                Paragraph("<b>LEXICON TECHNOLOGY</b><br/>123 Tech Center, #05-01<br/>Singapore 123456<br/>Email: info@lexicon.sg", normal_style),
                Paragraph(f"<b>INVOICE</b><br/>Invoice No: INV-{order_dict['order_number']}<br/>Date: {order_dict['created_at'][:10]}<br/>Status: {order_dict['status'].upper()}", normal_style)
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

        for item in order_dict.get("items", []):
            product_name = item.get("product_name", "Product")
            unit_price = item.get("unit_price", "0.00")
            qty = item.get("quantity", 1)
            total_price = item.get("total_price", "0.00")

            items_data.append([
                Paragraph(product_name, normal_style),
                Paragraph(str(qty), normal_style),
                Paragraph(f"${float(unit_price):.2f}", normal_style),
                Paragraph(f"${float(total_price):.2f}", normal_style)
            ])

        subtotal = order_dict.get("subtotal", "0.00")
        shipping = order_dict.get("shipping_cost", "0.00")
        total = order_dict.get("total", "0.00")

        items_data.append([Paragraph("", normal_style), Paragraph("", normal_style), Paragraph("<b>Subtotal:</b>", normal_style), Paragraph(f"${float(subtotal):.2f}", normal_style)])
        items_data.append([Paragraph("", normal_style), Paragraph("", normal_style), Paragraph("<b>Shipping:</b>", normal_style), Paragraph("FREE" if float(shipping) == 0 else f"${float(shipping):.2f}", normal_style)])
        items_data.append([Paragraph("", normal_style), Paragraph("", normal_style), Paragraph("<b>Total:</b>", bold_style), Paragraph(f"${float(total):.2f}", bold_style)])

        items_table = Table(items_data, colWidths=[280, 50, 100, 110])
        items_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor("#cbd5e1")),
            ('LINEBELOW', (0,1), (-1,-4), 0.5, colors.HexColor("#e2e8f0")),
            ('LINEBELOW', (2,-3), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 30))

        elements.append(Paragraph("<para align=center>Thank you for shopping with Lexicon Technology!</para>", bold_style))

        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"invoice-{order_number}.pdf", content_type='application/pdf')

class AddressListView(APIView):
    def get(self, request):
        ensure_database_seeded()
        addresses = Address.objects.all()
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data or {}
        user = User.objects.filter(username="guru").first() or User.objects.first()

        is_default = data.get("is_default", False)
        if is_default:
            Address.objects.all().update(is_default=False)

        address = Address.objects.create(
            user=user,
            label=data.get("label", "Home"),
            full_name=data.get("full_name", "guru k"),
            phone=data.get("phone", "+65 9123 4567"),
            address_line1=data.get("address_line1", ""),
            address_line2=data.get("address_line2", ""),
            city=data.get("city", "Singapore"),
            state=data.get("state", "Singapore"),
            postal_code=data.get("postal_code", "123456"),
            country=data.get("country", "Singapore"),
            is_default=is_default
        )
        serializer = AddressSerializer(address)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AddressDetailView(APIView):
    def patch(self, request, pk):
        address = Address.objects.filter(pk=pk).first()
        if not address:
            return Response({"error": "Address not found"}, status=404)

        data = request.data or {}
        if data.get("is_default"):
            Address.objects.exclude(pk=pk).update(is_default=False)

        serializer = AddressSerializer(address, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        address = Address.objects.filter(pk=pk).first()
        if not address:
            return Response({"error": "Address not found"}, status=404)

        was_default = address.is_default
        address.delete()

        if was_default and Address.objects.exists():
            first_addr = Address.objects.first()
            first_addr.is_default = True
            first_addr.save()

        return Response({"message": "Address deleted successfully"})

class AddressSetDefaultView(APIView):
    def post(self, request, pk):
        address = Address.objects.filter(pk=pk).first()
        if not address:
            return Response({"error": "Address not found"}, status=404)

        Address.objects.all().update(is_default=False)
        address.is_default = True
        address.save()

        serializer = AddressSerializer(address)
        return Response(serializer.data)
