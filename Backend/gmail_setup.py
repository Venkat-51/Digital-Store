"""
One-time Gmail API OAuth2 Setup Script
========================================
Run this ONCE to authorize your Gmail account.
It will open a browser → you sign in → token.json is saved.
After that, invoice emails send automatically via Gmail API (HTTPS).

SETUP STEPS BEFORE RUNNING:
1. Go to: https://console.cloud.google.com/
2. Create a project (or select existing)
3. Go to APIs & Services → Library → search "Gmail API" → Enable it
4. Go to APIs & Services → Credentials
5. Click "Create Credentials" → "OAuth client ID"
6. Application type: "Desktop app", Name: "Lexicon Mailer"
7. Click "Download JSON" → rename to credentials.json
8. Put credentials.json in this folder (same folder as this script)
9. Run: python gmail_setup.py
"""

import os
import sys

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
except ImportError:
    print("ERROR: Missing packages. Run:")
    print("  venv\\Scripts\\pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)

SCOPES = ['https://www.googleapis.com/auth/gmail.send']
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')
TOKEN_FILE = os.path.join(os.path.dirname(__file__), 'token.json')


def main():
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"\nERROR: credentials.json not found at:\n  {CREDENTIALS_FILE}")
        print("\nFollow these steps:")
        print("  1. Go to https://console.cloud.google.com/")
        print("  2. APIs & Services → Library → Gmail API → Enable")
        print("  3. APIs & Services → Credentials → Create Credentials → OAuth client ID")
        print("  4. Application type: Desktop app → Download JSON")
        print("  5. Rename the file to 'credentials.json' and put it in the Backend folder")
        print("  6. Run this script again")
        sys.exit(1)

    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            print("Token refreshed successfully.")
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            print("\nOpening browser for Gmail authorization...")
            print("Sign in with: venkateswaranuec@gmail.com")
            creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
        print(f"\nSUCCESS! token.json saved to: {TOKEN_FILE}")
        print("Invoice emails will now send via Gmail API automatically.")
    else:
        print("Token is already valid. Gmail API is ready to use.")


if __name__ == '__main__':
    main()
