"""Typing hints and TypedDict."""
from typing import List, Dict, TypedDict
class Score(TypedDict):
    name: str
    points: int
def top_three(xs: List[int]) -> List[int]:
    return sorted(xs)[-3:]
print(top_three([3,1,4,1,5,9]))
user: Score = {"name":"Ada","points":95}
print(user)
