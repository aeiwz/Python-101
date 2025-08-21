"""Pipeline: StandardScaler + LogisticRegression."""
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris
X, y = load_iris(return_X_y=True)
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=500))
pipe.fit(X, y)
print("train acc:", round(pipe.score(X, y),3))
