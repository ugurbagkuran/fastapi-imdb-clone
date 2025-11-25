from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def get_database():
    """
    Diğer dosyalardan (Auth, Movies) veritabanına erişmek istediğimizde
    bu fonksiyonu çağıracağız.
    """
    return db.client[settings.DB_NAME]

async def connect_to_mongo():
    """Uygulama başlarken çalışacak"""
    db.client = AsyncIOMotorClient(settings.MONGO_URL)
    print("🟢 MongoDB Bağlantısı Başarılı!")

async def close_mongo_connection():
    """Uygulama kapanırken çalışacak"""
    db.client.close()
    print("🔴 MongoDB Bağlantısı Kapatıldı.")