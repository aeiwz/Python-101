"""Asyncio basic coroutine and run."""
import asyncio
async def hello():
    await asyncio.sleep(0.1)
    print("hello async")
asyncio.run(hello())
