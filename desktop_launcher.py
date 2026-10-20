import os
import sys
import threading
import time
import uvicorn
from fastapi.staticfiles import StaticFiles

# Setup paths
if getattr(sys, 'frozen', False):
    # PyInstaller bundle directory
    BASE_DIR = sys._MEIPASS
    DATA_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = BASE_DIR

API_DIR = os.path.join(BASE_DIR, "services", "api")
WEB_DIST_DIR = os.path.join(BASE_DIR, "apps", "web", "dist")

if API_DIR not in sys.path:
    sys.path.insert(0, API_DIR)

# Set database path in user writable folder (same folder as executable or root)
db_path = os.path.join(DATA_DIR, "vaultwise_dev.db").replace("\\", "/")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_path}"
os.environ["DATABASE_URL_SYNC"] = f"sqlite:///{db_path}"

from app.main import app as fastapi_app

# Mount web build static files
if os.path.exists(WEB_DIST_DIR):
    fastapi_app.mount("/", StaticFiles(directory=WEB_DIST_DIR, html=True), name="static")

def run_backend(port=8000):
    config = uvicorn.Config(
        fastapi_app,
        host="127.0.0.1",
        port=port,
        log_level="error",
        access_log=False
    )
    server = uvicorn.Server(config)
    server.run()

def main():
    import webview
    port = 8000

    # Start FastAPI backend in a background daemon thread
    server_thread = threading.Thread(target=run_backend, args=(port,), daemon=True)
    server_thread.start()

    time.sleep(1.0)
    target_url = f"http://127.0.0.1:{port}"

    # Create native Windows Desktop Window
    webview.create_window(
        title="Vaultwise — Personal Finance Analyzer",
        url=target_url,
        width=1280,
        height=820,
        min_size=(960, 640),
        text_select=True,
        confirm_close=False,
    )

    webview.start(private_mode=False)

if __name__ == "__main__":
    main()
