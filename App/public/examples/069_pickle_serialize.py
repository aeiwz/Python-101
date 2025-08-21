"""Serialize Python objects with pickle (use cautiously)."""
import pickle
obj = {"a":1,"b":[2,3]}
data = pickle.dumps(obj)
print(pickle.loads(data))
