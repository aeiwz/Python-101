"""Assertions for internal checks (disable with -O)."""
def mean(a,b):
    assert isinstance(a,(int,float)) and isinstance(b,(int,float))
    return (a+b)/2
print(mean(2,4))
