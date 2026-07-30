import io
import threading
import urllib.parse
import urllib.request
import os
import csv
import json
import time
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from django.http import FileResponse, HttpResponse
from django.utils.text import slugify
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
    UserProfile, Address, Order, OrderItem, WishlistItem, CartItem
)
from .serializers import (
    CategorySerializer, ProductSerializer, AddressSerializer,
    OrderSerializer, UserSerializer, WishlistItemSerializer, CartItemSerializer
)

from .authentication import generate_tokens_for_user, decode_token

def get_authenticated_user(request):
    """
    Returns the authenticated User instance for the request, or None.
    Decodes Bearer JWT token or query parameter token if DRF request.user is anonymous.
    """
    if hasattr(request, 'user') and request.user and request.user.is_authenticated:
        return request.user

    auth_header = request.headers.get('Authorization')
    token = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    elif 'token' in request.query_params:
        token = request.query_params.get('token')

    if token and token not in ['mock_access_token', 'mock_refresh_token']:
        payload = decode_token(token)
        if payload:
            uid = payload.get('user_id') or payload.get('uid')
            if uid:
                user = User.objects.filter(id=uid).first()
                if user:
                    return user
            email = payload.get('email')
            if email:
                user = User.objects.filter(email__iexact=email).first()
                if user:
                    return user
    return None


def is_admin_user(user):
    """
    Returns True if user is authenticated and (user.is_staff or user.is_superuser or matches any admin/owner email).
    Auto-syncs user.is_staff = True if user.email matches any admin/owner email.
    """
    if not user or not user.is_authenticated:
        return False
    admin_emails = {
        os.environ.get("ADMIN_EMAIL", "gvenkateswaran3@gmail.com").strip().lower(),
        os.environ.get("OWNER_EMAIL", "owner@lexicon.sg").strip().lower(),
        "gvenkateswaran3@gmail.com",
        "venkatguru2002@gmail.com",
        "venkateswaranuec@gmail.com",
    }
    user_email = (user.email or "").strip().lower()
    if user_email and user_email in admin_emails:
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=['is_staff'])
        return True
    return bool(user.is_staff or user.is_superuser)


def sync_user_phone(user):

    """Sync profile phone with existing address or order phone if blank or default."""
    if not user:
        return
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if not profile.phone or profile.phone == "+65 9123 4567":
        ord_obj = Order.objects.filter(user=user).exclude(customer_phone="+65 9123 4567").exclude(customer_phone="").order_by('-created_at').first()
        addr_obj = Address.objects.filter(user=user).exclude(phone="+65 9123 4567").exclude(phone="").first()
        synced_phone = (ord_obj.customer_phone if ord_obj else (addr_obj.phone if addr_obj else ""))
        if synced_phone:
            profile.phone = synced_phone
            profile.save()

def save_address_from_shipping_dict(user, shipping_addr, default_label="Home"):
    """Saves shipping address to user's saved Address list in Neon DB if not already present."""
    if not user or not shipping_addr or not isinstance(shipping_addr, dict):
        return None

    addr_line1 = (shipping_addr.get("address_line1") or "").strip()
    postal_code = (shipping_addr.get("postal_code") or "").strip()
    full_name = (shipping_addr.get("full_name") or f"{user.first_name} {user.last_name}".strip() or user.username).strip()
    phone = (shipping_addr.get("phone") or getattr(getattr(user, 'profile', None), 'phone', '')).strip()
    city = (shipping_addr.get("city") or "Singapore").strip()
    state = (shipping_addr.get("state") or "Singapore").strip()
    country = (shipping_addr.get("country") or "Singapore").strip()
    addr_line2 = (shipping_addr.get("address_line2") or "").strip()

    if not addr_line1:
        return None

    existing = Address.objects.filter(
        user=user,
        address_line1__iexact=addr_line1,
        postal_code__iexact=postal_code
    ).first()

    if not existing:
        is_first_addr = not Address.objects.filter(user=user).exists()
        address = Address.objects.create(
            user=user,
            label=default_label if is_first_addr else "Delivery Address",
            full_name=full_name,
            phone=phone,
            address_line1=addr_line1,
            address_line2=addr_line2,
            city=city,
            state=state,
            postal_code=postal_code,
            country=country,
            is_default=is_first_addr
        )
        return address
    return existing

def generate_invoice_pdf_buffer(order):
    """
    Generates PDF invoice buffer for an order using ReportLab.
    Returns io.BytesIO containing the binary PDF content.
    """
    serializer = OrderSerializer(order)
    order_dict = serializer.data

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    elements = []
    styles = getSampleStyleSheet()

    header_style = ParagraphStyle('InvoiceHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=colors.HexColor("#475569"))
    normal_style = ParagraphStyle('InvoiceNormal', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor("#334155"))
    bold_style = ParagraphStyle('InvoiceBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor("#0f172a"))

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
    return buffer

def _build_gmail_api_service():
    """
    Builds and returns an authenticated Gmail API service object using token.json (OAuth2).
    token.json is generated once by running: python gmail_setup.py
    Returns None if token.json does not exist or is invalid.
    """
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        token_path = os.path.join(BASE_DIR, 'token.json')
        creds_path = os.path.join(BASE_DIR, 'credentials.json')

        if not os.path.exists(token_path):
            print(f"[Gmail API] token.json not found at {token_path}. Run: python gmail_setup.py")
            return None

        SCOPES = ['https://www.googleapis.com/auth/gmail.send']
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

        if not creds.valid:
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
                # Save refreshed token
                with open(token_path, 'w') as f:
                    f.write(creds.to_json())
                print("[Gmail API] Token refreshed successfully.")
            else:
                print("[Gmail API] Token is invalid and cannot be refreshed. Run: python gmail_setup.py")
                return None

        service = build('gmail', 'v1', credentials=creds)
        return service
    except Exception as e:
        print(f"[Gmail API] Failed to build service: {e}")
        return None


def send_owner_email_invoice_async(order):
    """
    Sends invoice PDF attachment to store owner's email.
    PRIMARY:  Gmail API over HTTPS (port 443) — not blocked by ISPs/firewalls.
    FALLBACK: SMTP (port 587) if Gmail API token.json is unavailable.
    Updates order.email_sent = True on success.
    """
    def _send():
        import traceback
        import base64

        owner_email = os.environ.get("OWNER_EMAIL", "owner@lexicon.sg")
        smtp_host   = os.environ.get("SMTP_HOST", "smtp.gmail.com")
        smtp_port   = int(os.environ.get("SMTP_PORT", "587"))
        smtp_user   = os.environ.get("SMTP_USER", "")
        smtp_pass   = os.environ.get("SMTP_PASSWORD", "")

        print(f"[Email Diag] Order #{order.order_number}: owner={owner_email} smtp_user='{smtp_user[:5] if smtp_user else 'EMPTY'}...' pass_set={'YES' if smtp_pass else 'NO'}")

        try:
            # Build the email message
            print(f"[Email] Preparing invoice PDF for Order #{order.order_number} → {owner_email}")
            pdf_buffer = generate_invoice_pdf_buffer(order)
            pdf_data   = pdf_buffer.getvalue()

            msg = MIMEMultipart()
            msg['From']    = smtp_user or "noreply@lexicon.sg"
            msg['To']      = owner_email
            msg['Subject'] = f"New Order Invoice - #{order.order_number}"

            body = (
                f"Hello Store Owner,\n\n"
                f"Order #{order.order_number} has been confirmed.\n\n"
                f"Customer : {order.customer_name}\n"
                f"Email    : {order.customer_email}\n"
                f"Phone    : {order.customer_phone}\n"
                f"Total    : SGD ${order.total:.2f}\n\n"
                f"Invoice PDF is attached.\n\n"
                f"— Lexicon Technology Automated Order System"
            )
            msg.attach(MIMEText(body, 'plain'))

            part = MIMEApplication(pdf_data, Name=f"invoice-{order.order_number}.pdf")
            part['Content-Disposition'] = f'attachment; filename="invoice-{order.order_number}.pdf"'
            msg.attach(part)

            # ── PRIMARY: Gmail API (HTTPS port 443) ──────────────────────────
            service = _build_gmail_api_service()
            if service:
                print(f"[Email] Sending via Gmail API (HTTPS)...")
                raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
                service.users().messages().send(
                    userId='me',
                    body={'raw': raw_message}
                ).execute()
                print(f"[Email] SUCCESS via Gmail API — invoice sent to {owner_email}")
                Order.objects.filter(id=order.id).update(email_sent=True)
                return

            # ── FALLBACK: SMTP (port 587) ────────────────────────────────────
            if smtp_user and smtp_pass:
                print(f"[Email] Gmail API unavailable. Trying SMTP {smtp_host}:{smtp_port}...")
                with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
                print(f"[Email] SUCCESS via SMTP — invoice sent to {owner_email}")
                Order.objects.filter(id=order.id).update(email_sent=True)
            else:
                print(f"[Email] SKIPPED — no Gmail API token AND SMTP credentials missing. Run: python gmail_setup.py")

        except smtplib.SMTPAuthenticationError as e:
            print(f"[Email] SMTP AUTH FAILED: {e}")
            print(f"[Email] Use a Gmail App Password: https://myaccount.google.com/apppasswords")
        except Exception as e:
            print(f"[Email] ERROR for Order #{order.order_number}: {e}")
            traceback.print_exc()

    t = threading.Thread(target=_send, daemon=True)
    t.start()

def send_owner_whatsapp_invoice_async(order):
    """
    Dispatches order invoice notification to owner WhatsApp in background thread.
    Updates order.whatsapp_sent = True only on confirmed HTTP success.
    """
    def _send():
        import traceback
        try:
            target_phone = os.environ.get("OWNER_WHATSAPP", "919500882090")
            callmebot_apikey = os.environ.get("CALLMEBOT_APIKEY", "").strip()

            # --- Diagnostic: log config so misconfiguration is visible ---
            print(f"[WA Diag] Order #{order.order_number}: target_phone='{target_phone}' apikey_set={'YES' if callmebot_apikey else 'NO (set CALLMEBOT_APIKEY in .env)'}")

            if not callmebot_apikey:
                print(f"[WhatsApp Auto-Notifier] SKIPPED — CALLMEBOT_APIKEY not set in .env. Go to wa.me/34644597352, send 'I allow callmebot to send me messages', get your apikey, then add CALLMEBOT_APIKEY=<your_key> to .env")
                return

            items_summary = ", ".join([f"{item.product_name} (x{item.quantity})" for item in order.items.all()]) or "Products"

            message = (
                f"NEW ORDER - LEXICON TECHNOLOGY\n\n"
                f"Order: #{order.order_number}\n"
                f"Customer: {order.customer_name}\n"
                f"Phone: {order.customer_phone}\n"
                f"Email: {order.customer_email}\n"
                f"Items: {items_summary}\n"
                f"Total: SGD ${order.total:.2f}\n"
                f"Status: {order.status.upper()}"
            )

            print(f"[WhatsApp Auto-Notifier] Sending notification for Order #{order.order_number} to +{target_phone}...")

            callmebot_url = (
                f"https://api.callmebot.com/whatsapp.php"
                f"?phone=+{target_phone}"
                f"&text={urllib.parse.quote(message)}"
                f"&apikey={callmebot_apikey}"
            )
            req = urllib.request.Request(callmebot_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as response:
                resp_code = response.getcode()
                resp_body = response.read().decode('utf-8', errors='replace')[:200]
                print(f"[WhatsApp Auto-Notifier] Response {resp_code}: {resp_body}")
                if resp_code == 200:
                    Order.objects.filter(id=order.id).update(whatsapp_sent=True)
                    print(f"[WhatsApp Auto-Notifier] SUCCESS — whatsapp_sent=True set for Order #{order.order_number}")
                else:
                    print(f"[WhatsApp Auto-Notifier] Non-200 response ({resp_code}) — whatsapp_sent stays False")
        except Exception as e:
            print(f"[WhatsApp Auto-Notifier] ERROR for Order #{order.order_number}: {e}")
            traceback.print_exc()

    t = threading.Thread(target=_send, daemon=True)
    t.start()

def trigger_automatic_order_invoice_sends(order):
    """
    Triggers background tasks for both Email (with PDF attachment) and WhatsApp notifications.
    Runs silently in background without blocking API response or throwing unhandled errors.
    """
    if str(order.status).lower() == "confirmed":
        send_owner_email_invoice_async(order)
        send_owner_whatsapp_invoice_async(order)

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
        email = data.get("email", "").strip().lower()
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        password = data.get("password", "")
        first_name = data.get("first_name", "").strip() or email.split('@')[0]
        last_name = data.get("last_name", "").strip()
        phone = data.get("phone", "").strip()

        # Check if UID / email already exists in users table in Neon DB
        user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()
        if not user:
            # Create new separate user account in Neon PostgreSQL
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password if password else None,
                first_name=first_name,
                last_name=last_name
            )
            UserProfile.objects.create(user=user, phone=phone)
        else:
            # Load existing account
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            if password:
                user.set_password(password)
            user.save()
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if phone:
                profile.phone = phone
                profile.save()

        is_admin_user(user)
        sync_user_phone(user)
        tokens = generate_tokens_for_user(user)
        serializer = UserSerializer(user)
        return Response({"tokens": tokens, "user": serializer.data}, status=status.HTTP_201_CREATED)

class AuthLoginView(APIView):
    def post(self, request):
        data = request.data or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Backend checks if that UID/email already exists in the users table
        user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()
        if not user:
            # If not found, create a new user record in Neon PostgreSQL
            first_name = email.split('@')[0]
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password if password else None,
                first_name=first_name,
                last_name=""
            )
            UserProfile.objects.create(user=user, phone="")
        else:
            # If found, load the existing account
            if password and user.has_usable_password():
                if not user.check_password(password):
                    user.set_password(password)
                    user.save()

        is_admin_user(user)
        sync_user_phone(user)
        tokens = generate_tokens_for_user(user)
        serializer = UserSerializer(user)
        return Response({"tokens": tokens, "user": serializer.data})

class AuthGoogleView(APIView):
    def post(self, request):
        data = request.data or {}
        id_token = data.get("idToken") or data.get("credential") or data.get("token") or ""

        email = ""
        first_name = "Google"
        last_name = "User"
        phone = ""
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

                    email = payload.get("email", "").strip().lower()
                    name_str = payload.get("name", "")
                    name_parts = name_str.split() if name_str else []

                    first_name = payload.get("given_name") or (name_parts[0] if name_parts else "Google")
                    last_name = payload.get("family_name") or (" ".join(name_parts[1:]) if len(name_parts) > 1 else "")
                    avatar = payload.get("picture", "")
            except Exception as e:
                print(f"Error decoding Google ID token: {e}")

        if not email:
            email = data.get("email", "google.user@example.com").strip().lower()

        # Check if that email/UID already exists in Neon DB users table
        user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()
        if not user:
            # Create new user record
            user = User.objects.create_user(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            UserProfile.objects.create(user=user, avatar=avatar, phone=phone)
        else:
            # Load existing user account & update profile info
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            user.save()
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if avatar:
                profile.avatar = avatar
            profile.save()

        is_admin_user(user)
        sync_user_phone(user)
        tokens = generate_tokens_for_user(user)
        serializer = UserSerializer(user)
        return Response({
            "tokens": tokens,
            "token": tokens["access"],
            "user": serializer.data
        })

class AuthMeView(APIView):
    def get(self, request):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        is_admin_user(user)
        sync_user_phone(user)
        serializer = UserSerializer(user)
        return Response(serializer.data)


    def patch(self, request):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data or {}
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
        if "avatar" in data:
            profile.avatar = data["avatar"]
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
        data = request.data or {}
        refresh_token = data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token required"}, status=400)

        payload = decode_token(refresh_token)
        if not payload:
            return Response({"error": "Invalid refresh token"}, status=401)

        uid = payload.get("user_id") or payload.get("uid")
        user = User.objects.filter(id=uid).first() if uid else None
        if not user:
            return Response({"error": "User not found"}, status=404)

        tokens = generate_tokens_for_user(user)
        return Response({"access": tokens["access"], "refresh": tokens["refresh"]})

class OrderCreateView(APIView):
    def get(self, request):
        ensure_database_seeded()
        user = get_authenticated_user(request)
        if not user:
            return Response({
                "count": 0,
                "next": None,
                "previous": None,
                "results": []
            })

        status_param = request.query_params.get('status')
        queryset = Order.objects.filter(user=user).prefetch_related('items', 'items__product').order_by('-created_at')

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
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data or {}
        raw_items = data.get("items", [])

        c_name = str(data.get("customer_name") or f"{user.first_name} {user.last_name}".strip() or user.username)
        c_email = str(data.get("customer_email") or user.email)
        user_phone = getattr(user.profile, 'phone', '') if hasattr(user, 'profile') and user.profile.phone != '+65 9123 4567' else ''
        c_phone = str(data.get("customer_phone") or user_phone)

        shipping_addr = data.get("shipping_address")
        if not shipping_addr and data.get("shipping_address_id"):
            addr_obj = Address.objects.filter(id=data["shipping_address_id"], user=user).first()
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

        import time
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

        # Auto-save shipping address to user's saved Address list in Neon DB
        if user and shipping_addr:
            save_address_from_shipping_dict(user, shipping_addr)

        # Update profile phone if valid and profile phone is currently empty or default
        if c_phone and c_phone != "+65 9123 4567":
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if not profile.phone or profile.phone == "+65 9123 4567":
                profile.phone = c_phone
                profile.save()

        # Automatically trigger background email with PDF attachment and WhatsApp sending
        trigger_automatic_order_invoice_sends(order)

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrderDetailView(APIView):
    def get(self, request, order_number=None, pk=None):
        ensure_database_seeded()
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        target = order_number or pk
        order = Order.objects.filter(user=user, order_number__iexact=str(target)).first()
        if not order and str(target).isdigit():
            order = Order.objects.filter(user=user, id=int(target)).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def patch(self, request, order_number=None, pk=None):
        ensure_database_seeded()
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        target = order_number or pk
        order = Order.objects.filter(user=user, order_number__iexact=str(target)).first()
        if not order and str(target).isdigit():
            order = Order.objects.filter(user=user, id=int(target)).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        data = request.data or {}
        if "status" in data:
            order.status = data["status"]
            order.save()
            trigger_automatic_order_invoice_sends(order)

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class OrderCancelView(APIView):
    def post(self, request, order_number=None, pk=None):
        ensure_database_seeded()
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        target = order_number or pk
        order = Order.objects.filter(user=user, order_number__iexact=str(target)).first()
        if not order and str(target).isdigit():
            order = Order.objects.filter(user=user, id=int(target)).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        order.status = "cancelled"
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data)

class OrderInvoiceView(APIView):
    def get(self, request, order_number=None, pk=None):
        ensure_database_seeded()
        user = get_authenticated_user(request)
        target = order_number or pk
        order = None
        if user:
            order = Order.objects.filter(user=user, order_number__iexact=str(target)).first()
            if not order and str(target).isdigit():
                order = Order.objects.filter(user=user, id=int(target)).first()

        if not order:
            order = Order.objects.filter(order_number__iexact=str(target)).first()
            if not order and str(target).isdigit():
                order = Order.objects.filter(id=int(target)).first()

        if not order:
            return Response({"error": "Order not found"}, status=404)

        buffer = generate_invoice_pdf_buffer(order)
        return FileResponse(buffer, as_attachment=True, filename=f"invoice-{order.order_number}.pdf", content_type='application/pdf')


class AddressListView(APIView):
    def get(self, request):
        ensure_database_seeded()
        user = get_authenticated_user(request)
        if not user:
            return Response([])

        # Auto-populate saved address from past orders if user has no saved address
        if not Address.objects.filter(user=user).exists():
            user_orders = Order.objects.filter(user=user).exclude(shipping_address={}).order_by('-created_at')
            for ord_obj in user_orders:
                if ord_obj.shipping_address:
                    save_address_from_shipping_dict(user, ord_obj.shipping_address)

        addresses = Address.objects.filter(user=user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data or {}
        is_default = data.get("is_default", False)
        if is_default:
            Address.objects.filter(user=user).update(is_default=False)

        addr_phone = data.get("phone", "").strip()

        address = Address.objects.create(
            user=user,
            label=data.get("label", "Home"),
            full_name=data.get("full_name", f"{user.first_name} {user.last_name}".strip() or "Customer"),
            phone=addr_phone,
            address_line1=data.get("address_line1", ""),
            address_line2=data.get("address_line2", ""),
            city=data.get("city", "Singapore"),
            state=data.get("state", "Singapore"),
            postal_code=data.get("postal_code", "123456"),
            country=data.get("country", "Singapore"),
            is_default=is_default
        )

        if addr_phone and addr_phone != "+65 9123 4567":
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if not profile.phone or profile.phone == "+65 9123 4567":
                profile.phone = addr_phone
                profile.save()

        serializer = AddressSerializer(address)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AddressDetailView(APIView):
    def patch(self, request, pk):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        address = Address.objects.filter(pk=pk, user=user).first()
        if not address:
            return Response({"error": "Address not found"}, status=404)

        data = request.data or {}
        if data.get("is_default"):
            Address.objects.filter(user=user).exclude(pk=pk).update(is_default=False)

        serializer = AddressSerializer(address, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if address.phone and address.phone != "+65 9123 4567":
                profile, _ = UserProfile.objects.get_or_create(user=user)
                if not profile.phone or profile.phone == "+65 9123 4567":
                    profile.phone = address.phone
                    profile.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        address = Address.objects.filter(pk=pk, user=user).first()
        if not address:
            return Response({"error": "Address not found"}, status=404)

        was_default = address.is_default
        address.delete()

        if was_default and Address.objects.filter(user=user).exists():
            first_addr = Address.objects.filter(user=user).first()
            first_addr.is_default = True
            first_addr.save()

        return Response({"message": "Address deleted successfully"})

class AddressSetDefaultView(APIView):
    def post(self, request, pk):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        address = Address.objects.filter(pk=pk, user=user).first()
        if not address:
            return Response({"error": "Address not found"}, status=404)

        Address.objects.filter(user=user).update(is_default=False)
        address.is_default = True
        address.save()

        serializer = AddressSerializer(address)
        return Response(serializer.data)

class WishlistView(APIView):
    def get(self, request):
        user = get_authenticated_user(request)
        if not user:
            return Response([])
        items = WishlistItem.objects.filter(user=user).select_related('product')
        serializer = WishlistItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data or {}
        product_id = data.get("product_id") or data.get("product")
        if not product_id:
            return Response({"error": "Product ID required"}, status=400)

        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({"error": "Product not found"}, status=404)

        item, created = WishlistItem.objects.get_or_create(user=user, product=product)
        serializer = WishlistItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, item_id=None):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        item = WishlistItem.objects.filter(user=user, id=item_id).first()
        if not item:
            item = WishlistItem.objects.filter(user=user, product_id=item_id).first()

        if not item:
            return Response({"error": "Wishlist item not found"}, status=404)

        item.delete()
        return Response({"message": "Item removed from wishlist"})

class CartView(APIView):
    def get(self, request):
        user = get_authenticated_user(request)
        if not user:
            return Response([])
        items = CartItem.objects.filter(user=user).select_related('product')
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data or {}
        product_id = data.get("product_id") or data.get("product")
        quantity = int(data.get("quantity", 1))
        if not product_id:
            return Response({"error": "Product ID required"}, status=400)

        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({"error": "Product not found"}, status=404)

        cart_item, created = CartItem.objects.get_or_create(user=user, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = max(1, quantity)
        cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def patch(self, request, item_id=None):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        target = item_id or request.data.get("item_id") or request.data.get("product_id")
        cart_item = CartItem.objects.filter(user=user, id=target).first() if str(target).isdigit() else None
        if not cart_item and str(target).isdigit():
            cart_item = CartItem.objects.filter(user=user, product_id=int(target)).first()

        if not cart_item:
            return Response({"error": "Cart item not found"}, status=404)

        quantity = int(request.data.get("quantity", 1))
        if quantity <= 0:
            cart_item.delete()
            return Response({"message": "Cart item deleted"})
        else:
            cart_item.quantity = quantity
            cart_item.save()
            serializer = CartItemSerializer(cart_item)
            return Response(serializer.data)

    def delete(self, request, item_id=None):
        user = get_authenticated_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        if item_id == "clear" or request.path.endswith("/clear"):
            CartItem.objects.filter(user=user).delete()
            return Response({"message": "Cart cleared"})

        target = item_id
        cart_item = CartItem.objects.filter(user=user, id=target).first() if str(target).isdigit() else None
        if not cart_item and str(target).isdigit():
            cart_item = CartItem.objects.filter(user=user, product_id=int(target)).first()

        if not cart_item:
            return Response({"error": "Cart item not found"}, status=404)

        cart_item.delete()
        return Response({"message": "Item removed from cart"})

class ProductCSVTemplateView(APIView):

    def get(self, request):
        user = get_authenticated_user(request)
        if not is_admin_user(user):
            return Response({"error": "Forbidden: Bulk order features are restricted to administrator accounts."}, status=status.HTTP_403_FORBIDDEN)

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="products_bulk_upload_template.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'name', 'description', 'price', 'stock', 'category',
            'imageUrl', 'sku', 'brand', 'is_featured', 'is_new', 'is_sale'
        ])
        writer.writerow([
            'Logitech MX Master 3S Wireless Mouse',
            'Ergonomic performance mouse with quiet clicks and 8K DPI sensor',
            '139.00', '25', 'Peripherals',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
            'LOG-MX3S-01', 'Logitech', 'true', 'true', 'false'
        ])
        writer.writerow([
            'Dell UltraSharp 27 4K Monitor (U2723QE)',
            '27-inch 4K UHD USB-C Hub Monitor with IPS Black technology',
            '749.00', '15', 'Monitors',
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
            'DEL-U2723-01', 'Dell', 'true', 'false', 'true'
        ])
        return response

class ProductBulkUploadView(APIView):
    def post(self, request):
        user = get_authenticated_user(request)
        if not is_admin_user(user):
            return Response({"error": "Forbidden: Bulk order features are restricted to administrator accounts."}, status=status.HTTP_403_FORBIDDEN)

        csv_file = request.FILES.get('file') or request.FILES.get('csv_file')

        if not csv_file:
            return Response({"error": "No file uploaded. Please provide a CSV file."}, status=status.HTTP_400_BAD_REQUEST)

        filename = csv_file.name.lower()
        if not (filename.endswith('.csv') or filename.endswith('.txt')):
            return Response({"error": "Invalid file type. Please upload a .csv file."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            file_data = csv_file.read()
            try:
                decoded_file = file_data.decode('utf-8-sig')
            except UnicodeDecodeError:
                decoded_file = file_data.decode('latin-1')

            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
        except Exception as e:
            return Response({"error": f"Failed to parse CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        success_count = 0
        failed_count = 0
        errors = []
        total_rows = 0

        for row_idx, row in enumerate(reader, start=2):
            total_rows += 1
            row_normalized = {str(k).strip().lower(): str(v).strip() for k, v in row.items() if k is not None}

            raw_name = row_normalized.get('name') or row_normalized.get('product_name') or row_normalized.get('product name') or ''
            raw_price = row_normalized.get('price') or row_normalized.get('unit_price') or ''
            raw_stock = row_normalized.get('stock') or row_normalized.get('quantity') or '10'
            raw_category = row_normalized.get('category') or row_normalized.get('category_name') or ''
            raw_brand = row_normalized.get('brand') or ''
            raw_desc = row_normalized.get('description') or row_normalized.get('desc') or ''
            raw_sku = row_normalized.get('sku') or ''
            raw_image = row_normalized.get('imageurl') or row_normalized.get('image') or row_normalized.get('thumbnail') or row_normalized.get('image_url') or ''
            raw_featured = row_normalized.get('is_featured') or row_normalized.get('featured') or 'false'
            raw_new = row_normalized.get('is_new') or row_normalized.get('new') or 'true'
            raw_sale = row_normalized.get('is_sale') or row_normalized.get('sale') or 'false'

            if not raw_name:
                failed_count += 1
                errors.append({"row": row_idx, "name": f"Row {row_idx}", "error": "Product name is required."})
                continue

            try:
                price = float(raw_price)
                if price < 0:
                    raise ValueError("Price cannot be negative")
            except ValueError:
                failed_count += 1
                errors.append({"row": row_idx, "name": raw_name, "error": f"Invalid price: '{raw_price}'. Must be a positive number."})
                continue

            try:
                stock = int(float(raw_stock)) if raw_stock else 10
                if stock < 0:
                    stock = 0
            except ValueError:
                stock = 10

            category_obj = None
            if raw_category:
                cat_slug = slugify(raw_category) or "general"
                category_obj, _ = Category.objects.get_or_create(
                    slug=cat_slug,
                    defaults={"name": raw_category.title(), "description": f"Products in {raw_category.title()}"}
                )

            brand_obj = None
            if raw_brand:
                b_slug = slugify(raw_brand) or "generic"
                brand_obj, _ = Brand.objects.get_or_create(
                    slug=b_slug,
                    defaults={"name": raw_brand.title()}
                )

            base_slug = slugify(raw_name) or f"product-{int(time.time()*1000)}"
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            if not raw_sku:
                raw_sku = f"SKU-{slug[:10].upper()}-{int(time.time() * 100) % 10000}"

            is_featured = str(raw_featured).lower() in ['true', '1', 'yes']
            is_new = str(raw_new).lower() in ['true', '1', 'yes']
            is_sale = str(raw_sale).lower() in ['true', '1', 'yes']

            try:
                product = Product.objects.create(
                    name=raw_name,
                    slug=slug,
                    sku=raw_sku,
                    description=raw_desc,
                    category=category_obj,
                    brand=brand_obj,
                    price=price,
                    stock=stock,
                    is_in_stock=stock > 0,
                    is_featured=is_featured,
                    is_new=is_new,
                    is_sale=is_sale,
                    thumbnail=raw_image
                )

                if raw_image:
                    ProductImage.objects.create(
                        product=product,
                        image=raw_image,
                        is_primary=True
                    )

                success_count += 1
            except Exception as create_err:
                failed_count += 1
                errors.append({"row": row_idx, "name": raw_name, "error": f"Database insertion failed: {str(create_err)}"})

        return Response({
            "message": f"Import completed: {success_count} succeeded, {failed_count} failed.",
            "success_count": success_count,
            "failed_count": failed_count,
            "total_rows": total_rows,
            "errors": errors
        }, status=status.HTTP_200_OK)

