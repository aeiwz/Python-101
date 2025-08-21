"""Closure captures free variables."""
def make_adder(k):
    def add(x): return x+k
    return add
plus5 = make_adder(5)
print(plus5(10))
