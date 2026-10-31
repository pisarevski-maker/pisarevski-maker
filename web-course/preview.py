from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class PreviewHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.mjs': 'text/javascript'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

root = Path(__file__).resolve().parent / 'public'
print('AINARIUM local preview: http://127.0.0.1:8894/index.html', flush=True)
ThreadingHTTPServer(('127.0.0.1', 8894), partial(PreviewHandler, directory=str(root))).serve_forever()
