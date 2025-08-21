"""classmethod vs staticmethod."""
class User:
    def __init__(self, name): self.name = name
    @classmethod
    def from_email(cls, email): return cls(email.split("@")[0])
    @staticmethod
    def shout(s): return s.upper()
u = User.from_email("ada@example.com")
print(u.name, User.shout("hi"))
