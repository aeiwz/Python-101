"""Context manager with contextlib.contextmanager."""
from contextlib import contextmanager
@contextmanager
def banner(msg):
    print("<<<", msg)
    try: yield
    finally: print(">>>", msg)
with banner("work"):
    print("inside")
