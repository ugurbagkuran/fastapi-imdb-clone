import asyncio
import redis.asyncio as redis

async def main():
    try:
        r = redis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)
        print("Attempting to ping Redis...")
        response = await r.ping()
        print(f"Redis Ping Response: {response}")
        
        await r.set("test_key", "test_value")
        val = await r.get("test_key")
        print(f"Test Key Value: {val}")
        
        print("SUCCESS")
        await r.close()
    except Exception as e:
        print(f"Redis Connection Error: {e}")
        import sys
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
