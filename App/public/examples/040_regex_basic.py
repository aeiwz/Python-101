"""Regular expressions: findall."""
import re
text = "Email me at ada@example.com and bob@test.org"
print(re.findall(r"[\w.-]+@[\w.-]+", text))
