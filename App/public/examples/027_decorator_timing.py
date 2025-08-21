"""Decorator to time a function."""
import time, functools
def timing(fn):
    @functools.wraps(fn)
    def wrap(*a, **kw):
        t0 = time.perf_counter()
        r = fn(*a, **kw)
        dt = (time.perf_counter()-t0)*1000
        print(f"{fn.__name__} took {dt:.2f} ms")
        return r
    return wrap

@timing
def work():
    s = sum(range(10_000))
    return s

work()
