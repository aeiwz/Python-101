"""Run multiple coroutines concurrently with gather."""
import asyncio
async def task(i):
    await asyncio.sleep(0.05*i)
    return i
print(asyncio.run(asyncio.gather(*(task(i) for i in range(5)))))
