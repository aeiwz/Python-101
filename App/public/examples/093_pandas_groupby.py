"""Groupby and aggregate."""
import pandas as pd
df = pd.DataFrame({"city":["A","A","B"], "sales":[10,15,7]})
print(df.groupby("city")["sales"].sum())
