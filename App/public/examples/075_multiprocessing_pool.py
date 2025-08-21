"""Multiprocessing Pool map."""
from multiprocessing import Pool
with Pool(processes=2) as pool:
    print(pool.map(lambda x: x*x, [1,2,3,4]))
