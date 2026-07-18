from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
GALLERY_DIR = PROJECT_ROOT / "media" / "gallery"
UPLOADS_DIR = PROJECT_ROOT / "media" / "uploads"

PHARMACY_INFO = {
    "name": "Forestal Machipisa Pharmacy",
    "about": "Now Open from 7.30 am to 10.00 pm",
    "address": "STD 4097 MACHIPISA, Harare African Township, Zimbabwe",
    "email": "help@machipisaforestal.com",
    "website": "machipisaforestal.com",
    "category": "Health/Beauty",
    "posts": [
        "Early morning hustle.",
        "Health and beauty",
        "Health and hygiene",
        "Personal Care products.",
    ],
}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
VIDEO_EXTS = {".mp4", ".mov", ".webm", ".mkv"}
