"""Abstract base classes with abc."""
from abc import ABC, abstractmethod
class Shape(ABC):
    @abstractmethod
    def area(self): ...
class Square(Shape):
    def __init__(self, s): self.s = s
    def area(self): return self.s*self.s
print(Square(3).area())
