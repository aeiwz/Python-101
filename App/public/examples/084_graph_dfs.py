"""Depth-first search (recursive)."""
g = {1:[2,3], 2:[4], 3:[4], 4:[]}
def dfs(v, seen=None, order=None):
    seen = seen or set(); order = order or []
    seen.add(v); order.append(v)
    for w in g[v]:
        if w not in seen: dfs(w, seen, order)
    return order
print(dfs(1))
