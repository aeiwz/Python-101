"""Filtering rows and selecting columns."""
import pandas as pd
df = pd.DataFrame({"name":["Ada","Bob","Cara"], "age":[21,19,22]})
print(df[df["age"]>=21][["name","age"]])
