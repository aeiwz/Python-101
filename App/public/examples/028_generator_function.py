"""Generator function using yield."""
def countdown(n):
    while n>0:
        yield n
        n -= 1
print(list(countdown(5)))
