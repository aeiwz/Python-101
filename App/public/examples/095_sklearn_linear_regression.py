"""Train/test split and LinearRegression (requires scikit-learn)."""
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import numpy as np
X = np.array([[1],[2],[3],[4],[5]], dtype=float)
y = np.array([2,4.1,6,8,10.1], dtype=float)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.4, random_state=0)
model = LinearRegression().fit(Xtr, ytr)
print("R^2 test:", round(model.score(Xte, yte),3))
