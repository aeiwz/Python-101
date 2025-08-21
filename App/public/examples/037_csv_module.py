"""CSV reading/writing."""
import csv, io
buf = io.StringIO()
writer = csv.writer(buf)
writer.writerow(["name","age"])
writer.writerow(["Ada",21])
writer.writerow(["Bob",19])
buf.seek(0)
reader = csv.DictReader(buf)
print(list(reader))
