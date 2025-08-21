"""Micro-benchmark with timeit."""
import timeit
print(timeit.timeit("sum(range(1000))", number=100))
