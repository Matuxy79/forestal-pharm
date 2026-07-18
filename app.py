import os
import re
import shutil
import time
from pathlib import Path

import chainlit as cl

from pharmacy_data import (
    PHARMACY_INFO,
    GALLERY_DIR,
    UPLOADS_DIR,
    PROJECT_ROOT,
    IMAGE_EXTS,
    VIDEO_EXTS,
)

INFO_MD = f"""# {PHARMACY_INFO['name']}

**{PHARMACY_INFO['about']}**

- **Address:** {PHARMACY_INFO['address']}
- **Email:** {PHARMACY_INFO['email']}
- **Website:** {PHARMACY_INFO['website']}
- **Category:** {PHARMACY_INFO['category']}

Recent posts: {" · ".join(PHARMACY_INFO['posts'])}

---
Attach a photo or video below (paperclip icon, or drag-and-drop) and I'll save it
into `media/uploads/` on this machine so it can be reused later.
"""


def _slugify(stem: str) -> str:
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip("-")
    return stem or "file"


def _elements_for_dir(directory: Path):
    elements = []
    if not directory.exists():
        return elements
    for path in sorted(directory.iterdir()):
        if not path.is_file() or path.name.lower() == "readme.md":
            continue
        ext = path.suffix.lower()
        if ext in IMAGE_EXTS:
            elements.append(cl.Image(path=str(path), name=path.name, display="inline"))
        elif ext in VIDEO_EXTS:
            elements.append(cl.Video(path=str(path), name=path.name, display="inline"))
    return elements


@cl.on_chat_start
async def start():
    gallery_elements = _elements_for_dir(GALLERY_DIR)
    content = INFO_MD
    if not gallery_elements:
        content += "\n_(No seed photos yet — drop images into `media/gallery/`.)_"
    actions = [cl.Action(name="show_gallery", payload={}, label="Show Gallery")]
    await cl.Message(content=content, elements=gallery_elements, actions=actions).send()


@cl.on_message
async def on_message(message: cl.Message):
    if not message.elements:
        await cl.Message(
            content="Attach an image or video using the paperclip icon (or drag-and-drop) "
            "and I'll save it to `media/uploads/`."
        ).send()
        return

    saved = []
    for element in message.elements:
        mime = (element.mime or "").lower()
        src_path = element.path
        if not src_path or not os.path.exists(src_path):
            continue

        original_name = element.name or Path(src_path).name
        ext = Path(original_name).suffix.lower()
        is_image = mime.startswith("image/") or ext in IMAGE_EXTS
        is_video = mime.startswith("video/") or ext in VIDEO_EXTS
        if not (is_image or is_video):
            continue  # skip non-media attachments for this stub

        stem = _slugify(Path(original_name).stem)
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        dest = UPLOADS_DIR / f"{timestamp}-{stem}{ext}"
        counter = 1
        while dest.exists():  # collision-safe
            dest = UPLOADS_DIR / f"{timestamp}-{stem}-{counter}{ext}"
            counter += 1

        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src_path, dest)
        saved.append((dest, "image" if is_image else "video"))

    if not saved:
        await cl.Message(content="I didn't find an image or video in that message.").send()
        return

    lines = ["Saved to disk:"]
    reply_elements = []
    for dest, kind in saved:
        rel = dest.relative_to(PROJECT_ROOT)
        lines.append(f"- `{rel}`  (rename/move this file freely — it's a real, permanent copy)")
        if kind == "image":
            reply_elements.append(cl.Image(path=str(dest), name=dest.name, display="inline"))
        else:
            reply_elements.append(cl.Video(path=str(dest), name=dest.name, display="inline"))

    await cl.Message(content="\n".join(lines), elements=reply_elements).send()


@cl.action_callback("show_gallery")
async def on_show_gallery(action: cl.Action):
    gallery_elements = _elements_for_dir(GALLERY_DIR)
    upload_elements = _elements_for_dir(UPLOADS_DIR)
    all_elements = gallery_elements + upload_elements
    if not all_elements:
        await cl.Message(content="No media yet in `media/gallery/` or `media/uploads/`.").send()
        return
    await cl.Message(
        content=f"Current gallery — {len(gallery_elements)} seed photo(s) + "
        f"{len(upload_elements)} uploaded file(s):",
        elements=all_elements,
        actions=[cl.Action(name="show_gallery", payload={}, label="Refresh Gallery")],
    ).send()
