"""Gzip compress/decompress bytes."""
import gzip, io
buf = io.BytesIO()
with gzip.GzipFile(fileobj=buf, mode="wb") as f:
    f.write(b"hello"*10)
compressed = buf.getvalue()
print("size:", len(compressed))
