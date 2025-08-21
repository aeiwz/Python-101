"""OOP: inheritance and method override."""
class Animal:
    def speak(self): return "sound"
class Dog(Animal):
    def speak(self): return "woof"
print(Animal().speak(), Dog().speak())
