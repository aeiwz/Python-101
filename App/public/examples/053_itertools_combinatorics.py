"""Combinatorics with itertools."""
import itertools
print(list(itertools.product([1,2], ["a","b"])))
print(list(itertools.combinations([1,2,3], 2)))
print(list(itertools.permutations([1,2,3], 2)))
