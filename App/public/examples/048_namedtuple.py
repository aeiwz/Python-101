"""namedtuple for lightweight records."""
from collections import namedtuple
Point = namedtuple("Point", "x y")
p = Point(3,4)
print(p.x, p.y)
