"""Define and use a custom exception."""
class NegativeError(Exception): pass
def ensure_positive(x):
    if x < 0: raise NegativeError("Negative not allowed")
    return x
print(ensure_positive(5))
