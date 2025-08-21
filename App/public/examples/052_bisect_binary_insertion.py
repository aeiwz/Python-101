"""Binary insertion/search with bisect."""
import bisect
a = [1,3,4,7]
bisect.insort(a, 5)
print(a, "index of 4:", bisect.bisect_left(a,4))
