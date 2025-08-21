"""Merging/joining DataFrames."""
import pandas as pd
a = pd.DataFrame({"id":[1,2], "name":["Ada","Bob"]})
b = pd.DataFrame({"id":[1,2], "score":[95,88]})
print(a.merge(b, on="id"))
