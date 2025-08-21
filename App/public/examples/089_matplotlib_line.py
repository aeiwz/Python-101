"""Simple line plot (requires matplotlib)."""
import matplotlib.pyplot as plt
ys = [1,3,2,4,3]
plt.plot(ys)
plt.title("Line Plot")
plt.savefig("line.png")
print("Saved line.png")
