# Forestal Machipisa Pharmacy

A local Chainlit stub for showcasing Forestal Machipisa Pharmacy (Harare, Zimbabwe).

**Features:**
- Displays pharmacy info (hours, address, contact)
- Gallery of seed photos harvested from the pharmacy's FB page
- Upload images/videos locally — they're saved as real files on disk for later reuse
- "Show Gallery" action aggregates seed photos + uploads

## Quick Start

### With Docker (easiest, all operating systems)

```bash
docker compose up --build --detach
# Access at http://localhost:8000
```

This exact command works in Windows PowerShell, Command Prompt, macOS, and Linux. It does not use `&&` and does not require `make`.

To stop the app:

```bash
docker compose down
```

If GNU Make is installed, `make run` is a shortcut for the same build-and-start operation. You do not need to run `make build` first.

### Local development (requires Python 3.12+)

```bash
make dev-install
make dev
```

Without Make, create the environment and run Chainlit using the commands for your shell:

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe run_local.py -w
```

**macOS/Linux:**

```bash
python3 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python run_local.py -w
```

This runs the app with hot-reload (`-w` flag), so changes to `app.py` / `pharmacy_data.py` restart automatically.

## Commands

```bash
make help       # Show all available targets
make build      # Build Docker image
make run        # Build and start the container
make stop       # Stop the container
make logs       # Follow container logs
make shell      # Open a shell inside the running container
make clean      # Remove image & container
make dev        # Run locally in .venv/ (with auto-reload)
make dev-install # Set up .venv/ for local development
```

## File Structure

```
forestal pharm/
├── app.py                  # Chainlit entrypoint
├── pharmacy_data.py        # Contact info, paths, constants
├── chainlit.md             # Welcome markdown
├── requirements.txt        # Dependencies (chainlit 2.11.1)
├── Dockerfile              # Container image
├── Makefile                # Convenient commands
├── docker-compose.yml      # Docker Compose config
├── .chainlit/
│   └── config.toml         # Chainlit config (upload enabled)
└── media/
    ├── gallery/            # Seed photos (9 FB images)
    │   └── README.md
    └── uploads/            # User uploads (auto-saved)
        └── README.md
```

## Adding Photos

**Seed photos (show on startup):** Drop `.jpg`/`.png`/`.webp` files into `media/gallery/`.

**Uploads (via chat):** Click the paperclip icon in the app, attach an image/video. It saves to `media/uploads/` with a timestamp prefix — you can rename/move these files freely afterward.

## Chainlit Notes

- Chainlit 2.11.1 (verified against docs.chainlit.io)
- `spontaneous_file_upload` enabled in config for the paperclip icon
- Elements are real files, not ephemeral — Chainlit's own session cache is wiped at shutdown, but our copies persist
- Video formats: `.mp4` is safest for inline playback; `.mov` will save but may not preview in all browsers

## Environment

- Python 3.12+ or Docker
- ~80 dependencies (chainlit + opentelemetry instrumentation suite)
- ~300MB final Docker image

## Architecture

1. **`app.py`**: Async event handlers
   - `@cl.on_chat_start` → renders About panel + seed gallery
   - `@cl.on_message` → detects uploads, saves to `media/uploads/` as durable copies, echoes back
   - `@cl.action_callback("show_gallery")` → lists both seed + uploaded media

2. **`pharmacy_data.py`**: Data + paths (isolated from Chainlit plumbing)

3. **Chainlit config**: Enables spontaneous file upload (paperclip), restricts to image/*+video/*, 5 files max, 200MB total
