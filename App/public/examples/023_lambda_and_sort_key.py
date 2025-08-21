"""Lambda and custom sort key."""
pairs = [("alice",3),("bob",1),("cara",2)]
pairs.sort(key=lambda p: p[1])
print(pairs)
