"""Pathlib path operations."""
from pathlib import Path
p = Path(".")
print([x.name for x in p.iterdir()][:5])
