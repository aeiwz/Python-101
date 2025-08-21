"""HTTP GET with urllib.request (no external deps)."""
from urllib.request import urlopen
url = "https://example.com"
with urlopen(url) as r:
    print("status:", r.status)
