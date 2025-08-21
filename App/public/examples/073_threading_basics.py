"""Threading basics: start/join."""
import threading, time
def work(i):
    time.sleep(0.1)
    print("done", i)
ts = [threading.Thread(target=work, args=(i,)) for i in range(3)]
[t.start() for t in ts]
[t.join() for t in ts]
