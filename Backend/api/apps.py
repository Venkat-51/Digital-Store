import os
import sys
from django.apps import AppConfig

def validate_whatsapp_config():
    """
    Validates Meta WhatsApp Cloud API environment configuration at backend startup.
    Prints status without exposing sensitive secret token values.
    """
    token = os.environ.get("WHATSAPP_TOKEN", "").strip()
    phone_number_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "").strip()
    business_account_id = os.environ.get("WHATSAPP_BUSINESS_ACCOUNT_ID", os.environ.get("WHATSAPP_ID", "")).strip()
    api_version = os.environ.get("WHATSAPP_API_VERSION", "v18.0").strip()

    print("\n[WhatsApp Cloud API Environment Validation]")
    print(f"  • WHATSAPP_API_VERSION           : {api_version}")
    print(f"  • WHATSAPP_PHONE_NUMBER_ID       : {phone_number_id if phone_number_id else 'NOT SET ⚠️'}")
    print(f"  • WHATSAPP_BUSINESS_ACCOUNT_ID   : {business_account_id if business_account_id else 'NOT SET (Optional)'}")
    
    if token:
        hidden_token = f"{token[:6]}...{token[-4:]}" if len(token) > 10 else "***"
        print(f"  • WHATSAPP_TOKEN                 : Configured ({hidden_token}, length {len(token)})\n")
    else:
        print("  • WHATSAPP_TOKEN                 : NOT SET ⚠️\n")


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        if any(arg in sys.argv for arg in ['runserver', 'gunicorn']) or 'gunicorn' in sys.argv[0]:
            validate_whatsapp_config()
