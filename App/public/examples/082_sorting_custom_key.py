"""Sorting with custom key: by length then alphabetic."""
words = ["pear","apple","fig","banana"]
print(sorted(words, key=lambda w: (len(w), w)))
