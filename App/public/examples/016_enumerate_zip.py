"""enumerate & zip to iterate with indices and in parallel."""
names = ["Ada","Bob","Cara"]
scores = [95, 88, 90]
for idx, (n, s) in enumerate(zip(names, scores), start=1):
    print(idx, n, s)
