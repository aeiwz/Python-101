"""Breadth-first search on adjacency list."""
from collections import deque
g = {1:[2,3], 2:[4], 3:[4], 4:[]}
def bfs(start):
    seen, q = {start}, deque([start])
    order = []
    while q:
        v = q.popleft(); order.append(v)
        for w in g[v]:
            if w not in seen:
                seen.add(w); q.append(w)
    return order
print(bfs(1))
