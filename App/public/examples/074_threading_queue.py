"""Thread-safe queue for producer/consumer."""
import threading, queue, time
q = queue.Queue()
def producer():
    for i in range(5): q.put(i)
    q.put(None)  # sentinel
def consumer():
    while True:
        x = q.get()
        if x is None: break
        print("got", x)
threading.Thread(target=producer).start()
threading.Thread(target=consumer).start()
time.sleep(0.5)
