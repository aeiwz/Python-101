"""Properties for computed/validated attributes."""
class Celsius:
    def __init__(self, degrees): self._c = degrees
    @property
    def c(self): return self._c
    @c.setter
    def c(self, v):
        if v < -273.15: raise ValueError("below absolute zero")
        self._c = v
t = Celsius(25); t.c = 30; print(t.c)
