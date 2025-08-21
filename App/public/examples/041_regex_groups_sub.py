"""Regex groups and substitution."""
import re
s = "2025-08-20"
m = re.match(r"(\d{4})-(\d{2})-(\d{2})", s)
print(m.groups())
print(re.sub("-", "/", s))
