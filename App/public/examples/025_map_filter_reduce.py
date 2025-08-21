"""map/filter/reduce with functools."""
from functools import reduce
nums = [1,2,3,4,5]
doubles = list(map(lambda x: x*2, nums))
evens = list(filter(lambda x: x%2==0, nums))
total = reduce(lambda a,b: a+b, nums)
print(doubles, evens, total)
