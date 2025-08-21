"""Group items with defaultdict(list)."""
from collections import defaultdict
groups = defaultdict(list)
pairs = [("a",1),("b",2),("a",3)]
for k,v in pairs:
    groups[k].append(v)
print(dict(groups))
