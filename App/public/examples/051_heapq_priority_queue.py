"""Min-heap priority queue with heapq."""
import heapq
h = []
for x in [5,1,3]:
    heapq.heappush(h, x)
print([heapq.heappop(h) for _ in range(len(h))])
