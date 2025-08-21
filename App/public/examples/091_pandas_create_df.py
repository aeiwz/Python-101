"""Create DataFrame (requires pandas)."""
import pandas as pd
df = pd.DataFrame({"name":["Ada","Bob"], "age":[21,19]})
print(df, "\n", df.describe())
