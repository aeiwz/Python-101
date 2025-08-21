"""Error handling with try/except/else/finally."""
def safe_div(a,b):
    try:
        q = a/b
    except ZeroDivisionError:
        return None
    else:
        return q
    finally:
        pass
print(safe_div(10,2), safe_div(1,0))
