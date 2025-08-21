"""OOP: class and instance methods."""
class Counter:
    def __init__(self): self.n = 0
    def inc(self): self.n += 1
c = Counter(); c.inc(); c.inc()
print(c.n)
