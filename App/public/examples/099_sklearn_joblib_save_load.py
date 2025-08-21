"""Persist model with joblib (requires scikit-learn)."""
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
import joblib
X, y = load_iris(return_X_y=True)
m = LogisticRegression(max_iter=500).fit(X, y)
joblib.dump(m, "model.joblib")
m2 = joblib.load("model.joblib")
print("ok:", hasattr(m2, "predict"))
