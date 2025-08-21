"""Histogram (requires matplotlib)."""
import matplotlib.pyplot as plt
import random
data = [random.gauss(0,1) for _ in range(1000)]
plt.hist(data, bins=30)
plt.title("Histogram")
plt.savefig("hist.png")
print("Saved hist.png")
