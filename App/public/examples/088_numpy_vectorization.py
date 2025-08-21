"""Vectorization vs Python loop."""
import numpy as np, time
x = np.arange(1_0000)
t0 = time.time(); s = (x*x).sum(); t1 = time.time()
print("sum squares:", s, "time:", round(t1-t0,4),"s")
