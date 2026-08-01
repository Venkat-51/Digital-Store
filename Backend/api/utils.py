import os
import csv
import urllib.parse
from pathlib import Path

def get_data_dir():
    """
    Returns the resolved Path to the CSV data directory.
    Priority:
    1. Environment variable DATA_DIR
    2. Django settings.DATA_DIR
    3. Existing data directory at Backend/data or project root data/
    4. Fallback default: Backend/data
    """
    env_dir = os.getenv('DATA_DIR')
    if env_dir:
        p = Path(env_dir).resolve()
        if p.exists():
            return p

    try:
        from django.conf import settings
        if hasattr(settings, 'DATA_DIR'):
            p = Path(settings.DATA_DIR).resolve()
            if p.exists():
                return p
    except Exception:
        pass

    backend_dir = Path(__file__).resolve().parent.parent
    candidates = [
        backend_dir / "data",
        backend_dir.parent / "data",
        Path.cwd() / "data",
        Path.cwd() / "Backend" / "data",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()

    return (backend_dir / "data").resolve()


DATA_DIR = get_data_dir()


def parse_csv(file_name):
    data_dir = get_data_dir()
    file_path = Path(file_name)

    if not file_path.is_file():
        file_path = data_dir / file_name

    # Fallback search if file doesn't exist in primary data_dir
    if not file_path.exists():
        backend_dir = Path(__file__).resolve().parent.parent
        alternate_paths = [
            backend_dir / "data" / file_name,
            backend_dir.parent / "data" / file_name,
            Path.cwd() / "data" / file_name,
            Path.cwd() / "Backend" / "data" / file_name,
        ]
        for alt in alternate_paths:
            if alt.exists():
                file_path = alt
                break

    data = []
    if not file_path.exists():
        return data

    with open(file_path, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)
    return data


# ==============================================================================
# PRODUCT IMAGE FALLBACK
# All real product images are now stored in the database (Product.thumbnail
# and ProductImage.image) and served from media/products/.
# This fallback is ONLY used when a product has no image at all in the DB.
# ==============================================================================

DEFAULT_TECH_IMAGE = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80"

def get_product_image_url(product_name):
    """Returns a default placeholder image. Real images come from the database."""
    return DEFAULT_TECH_IMAGE


