import jwt
import datetime
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

SECRET_KEY = getattr(settings, 'SECRET_KEY', 'django-insecure-lexicon-digital-store-neon-db-key')
ALGORITHM = 'HS256'

def generate_tokens_for_user(user):
    """
    Generates unique JWT access and refresh tokens for a user.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    access_payload = {
        'user_id': user.id,
        'email': user.email,
        'username': user.username,
        'exp': now + datetime.timedelta(days=7),
        'iat': now,
        'type': 'access'
    }
    refresh_payload = {
        'user_id': user.id,
        'email': user.email,
        'username': user.username,
        'exp': now + datetime.timedelta(days=30),
        'iat': now,
        'type': 'refresh'
    }
    
    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm=ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        'access': access_token,
        'refresh': refresh_token
    }

def decode_token(token):
    """
    Decodes a JWT token and returns payload if valid, else None.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception as e:
        print(f"Token decode error: {e}")
        return None

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        token = None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif 'token' in request.query_params:
            token = request.query_params.get('token')

        if not token:
            return None

        # Ignore mock string literal tokens if present without user lookup
        if token == 'mock_access_token' or token == 'mock_refresh_token':
            # Fallback for dev if needed
            return None

        payload = decode_token(token)
        if not payload:
            raise AuthenticationFailed('Invalid or expired token')

        user_id = payload.get('user_id') or payload.get('uid')
        email = payload.get('email')

        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
        if not user and email:
            user = User.objects.filter(email__iexact=email).first()

        if not user:
            raise AuthenticationFailed('User not found')

        return (user, token)
