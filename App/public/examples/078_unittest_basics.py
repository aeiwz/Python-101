"""Basic unit test with unittest (run as script)."""
import unittest
def add(a,b): return a+b
class T(unittest.TestCase):
    def test_add(self): self.assertEqual(add(2,3), 5)
if __name__ == "__main__":
    unittest.main()
