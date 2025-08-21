"""Cross-validation score."""
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
X, y = load_iris(return_X_y=True)
clf = LogisticRegression(max_iter=500)
print("cv mean:", round(cross_val_score(clf, X, y, cv=5).mean(),3))
