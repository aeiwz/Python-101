"""Time zones with zoneinfo (Py3.9+)."""
from datetime import datetime
from zoneinfo import ZoneInfo
bkk = datetime.now(ZoneInfo("Asia/Bangkok"))
utc = datetime.now(ZoneInfo("UTC"))
print("BKK:", bkk.isoformat())
print("UTC:", utc.isoformat())
