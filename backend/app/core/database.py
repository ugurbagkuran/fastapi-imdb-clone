from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    """
    Diğer dosyalardan (Auth, Movies) veritabanına erişmek istediğimizde
    bu fonksiyonu çağıracağız.
    """
    return db.client[settings.DB_NAME]

async def connect_to_mongo() -> None:
    """Uygulama başlarken çalışacak"""
    db.client = AsyncIOMotorClient(settings.MONGO_URL)
    print("MongoDB Bağlantısı Başarılı!")

async def close_mongo_connection() -> None:
    """Uygulama kapanırken çalışacak"""
    db.client.close()
    print("MongoDB Bağlantısı Kapatıldı.")