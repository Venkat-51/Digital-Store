import os
import csv
import urllib.parse
from pathlib import Path
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_DIR = BASE_DIR / "data"

def parse_csv(file_name):
    file_path = DATA_DIR / file_name
    data = []
    if not file_path.exists():
        return data
    with open(file_path, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)
    return data

# ==============================================================================
# MANUAL PRODUCT IMAGE OVERRIDES
# You can manually set or change any product image by adding its name below:
# ==============================================================================
PRODUCT_EXACT_IMAGES = {
    "Dell 24 USB-C Monitor Hub": "https://tse4.mm.bing.net/th/id/OIP.NjpI93OnimjBGeO3SaLhrwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    "Logitech MX Keys S Keyboard": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    "Logitech MX Master 3S Mouse": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    "Anker 12-in-1 USB-C Hub": "https://www.ankersmexlco.com.mx/images/large/60721878454506/Anker_575_USBC_Hub_12in1_Dual_HDMI_DP_Pl_155_1_ZOOM.jpg",
}

# Curated tech category keyword images (CORS-friendly, fast, high resolution)
KEYWORD_IMAGES = {
    "keyboard": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    "mouse": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    "monitor": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&auto=format&fit=crop&q=80",
    "webcam": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
    "hub": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
    "headset": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&auto=format&fit=crop&q=80",
    "headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "ssd": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
    "hdd": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&auto=format&fit=crop&q=80",
    "passport": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&auto=format&fit=crop&q=80",
    "usb": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80",
    "router": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
    "mesh": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    "switch": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
    "printer": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80",
    "projector": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80",
    "powerbank": "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600&auto=format&fit=crop&q=80",
    "battery": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    "shredder": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80",
    "stand": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&auto=format&fit=crop&q=80",
    "cable": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
}

DEFAULT_TECH_IMAGE = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80"

def get_product_image_url(product_name):
    name = (product_name or "").strip()
    
    # 1. Exact manual product name match
    if name in PRODUCT_EXACT_IMAGES:
        return PRODUCT_EXACT_IMAGES[name]
        
    name_lower = name.lower()
    
    # 2. Case-insensitive exact match
    for prod_title, img_url in PRODUCT_EXACT_IMAGES.items():
        if prod_title.lower() == name_lower:
            return img_url
    
    # 3. Keyword matches
    for kw, img_url in KEYWORD_IMAGES.items():
        if kw in name_lower:
            return img_url
            
    return DEFAULT_TECH_IMAGE

