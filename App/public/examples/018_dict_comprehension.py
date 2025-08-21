"""Dictionary comprehension."""
words = ["apple","banana","cherry"]
lengths = {w: len(w) for w in words}
print(lengths)
