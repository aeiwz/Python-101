"""Reading and writing text files with context manager."""
from pathlib import Path
p = Path("demo.txt")
p.write_text("Hello file!\nLine 2")
print(p.read_text())
