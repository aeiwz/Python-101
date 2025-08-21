"""Table-driven tests using subTest."""
import unittest
def is_even(x): return x%2==0
class T(unittest.TestCase):
    def test_cases(self):
        cases = [(2,True),(3,False),(10,True)]
        for x, want in cases:
            with self.subTest(x=x): self.assertEqual(is_even(x), want)
if __name__ == "__main__":
    unittest.main()
