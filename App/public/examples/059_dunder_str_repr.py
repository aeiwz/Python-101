"""__str__ vs __repr__ for debugging/logging."""
class User:
    def __init__(self, name): self.name = name
    def __repr__(self): return f"User({self.name!r})"
    def __str__(self):  return f"User<{self.name}>"
u = User("Ada")
print(repr(u), str(u))
