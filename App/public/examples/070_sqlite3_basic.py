"""SQLite basic CRUD."""
import sqlite3
conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("create table users(id int, name text)")
cur.execute("insert into users values (?,?)", (1,"Ada"))
conn.commit()
print(list(cur.execute("select * from users")))
