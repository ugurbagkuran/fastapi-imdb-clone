import redis.asyncio as redis
from app.core.config import settings

redis_client: redis.Redis | None = None

async def connect_to_redis():
    global redis_client
    redis_client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
    try:
        await redis_client.ping()
        print("Redis bağlantısı başarılı.")
    except Exception as e:
        print(f"Redis bağlantısı başarısız: {e}")

async def close_redis_connection():
    global redis_client
    if redis_client:
        await redis_client.close()
        print("Redis bağlantısı kapatıldı.")

def get_redis() -> redis.Redis:
    return redis_client

async def get_cache_version() -> int:
    if not redis_client: return 0
    version = await redis_client.get("semantic_search_version")
    return int(version) if version else 1

async def increment_cache_version():
    if redis_client:
        await redis_client.incr("semantic_search_version")
        print("Cache version incremented.")

