"""operator.itemgetter/attrgetter in sorting."""
from operator import itemgetter
rows = [{"name":"bob","age":19},{"name":"ada","age":21}]
print(sorted(rows, key=itemgetter("age")))
