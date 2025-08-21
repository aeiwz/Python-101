"""JSON serialization/deserialization."""
import json
obj = {"name":"Ada","score":98,"passed":True}
s = json.dumps(obj)
print(s)
print(json.loads(s))
