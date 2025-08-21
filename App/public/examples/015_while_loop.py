"""While loop with break/continue."""
n = 5
while n > 0:
    if n == 3:
        n -= 1
        continue
    print(n)
    if n == 1:
        break
    n -= 1
