"""Raising exceptions to signal errors."""
def sqrt_nonneg(x):
    if x < 0: raise ValueError("x must be >= 0")
    return x**0.5
print(sqrt_nonneg(9))
# print(sqrt_nonneg(-1))  # would raise
