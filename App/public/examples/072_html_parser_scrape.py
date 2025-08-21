"""Very small HTML parsing with html.parser."""
from html.parser import HTMLParser
class TitleParser(HTMLParser):
    def __init__(self): super().__init__(); self.in_title=False; self.title=None
    def handle_starttag(self, tag, attrs):
        if tag=="title": self.in_title=True
    def handle_endtag(self, tag):
        if tag=="title": self.in_title=False
    def handle_data(self, data):
        if self.in_title: self.title=(self.title or "")+data
p = TitleParser()
p.feed("<html><head><title>Demo</title></head></html>")
print(p.title)
