"""*args and **kwargs."""
def demo(*args, **kwargs):
    print("args:", args, "kwargs:", kwargs)
demo(1,2, x=7, y=9)
