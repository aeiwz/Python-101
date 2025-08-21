"""Memoization with lru_cache."""
from functools import lru_cache
@lru_cache(maxsize=None)
def fib(n):
    return n if n<2 else fib(n-1)+fib(n-2)
print([fib(i) for i in range(10)])
