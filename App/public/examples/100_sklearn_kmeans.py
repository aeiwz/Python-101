"""KMeans clustering example."""
from sklearn.datasets import load_iris
from sklearn.cluster import KMeans
X, _ = load_iris(return_X_y=True)
kmeans = KMeans(n_clusters=3, n_init="auto").fit(X)
print("centers shape:", kmeans.cluster_centers_.shape)
