"""Compute SHA-256 hash of data."""
import hashlib
data = b"hello"
print(hashlib.sha256(data).hexdigest())
