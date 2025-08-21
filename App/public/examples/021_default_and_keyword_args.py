"""Default and keyword arguments."""
def greet(name="Student", excited=False):
    msg = f"Hello, {name}!"
    if excited: msg += " 🎉"
    return msg
print(greet())
print(greet("Ada", excited=True))
