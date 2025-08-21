"""Generator expression vs list."""
gen = (i*i for i in range(5))
print(next(gen), next(gen))
print(sum(i for i in range(1000)))
