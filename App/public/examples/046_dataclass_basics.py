"""Dataclasses auto-generate init/eq/repr."""
from dataclasses import dataclass
@dataclass
class Student:
    name: str
    age: int
s = Student("Ada", 21)
print(s)
