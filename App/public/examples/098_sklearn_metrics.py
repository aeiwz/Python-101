"""Classification report & confusion matrix."""
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
X, y = load_iris(return_X_y=True)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
m = LogisticRegression(max_iter=500).fit(Xtr, ytr)
pred = m.predict(Xte)
print(confusion_matrix(yte, pred))
print(classification_report(yte, pred))
