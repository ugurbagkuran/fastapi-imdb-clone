from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, List
from datetime import datetime
from typing_extensions import Annotated

# --- META OLUŞTURUCU (ObjectId Helper) ---
# MongoDB'nin ObjectId'sini string'e çeviren sihirli değnek.
# Pydantic v2'de bu iş için Annotated ve BeforeValidator kullanıyoruz.
PyObjectId = Annotated[str, BeforeValidator(str)]

# --- TEMEL ŞEMA (Base) ---
# Ortak alanlar burada. Kod tekrarını önler.
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=10, description="Puan 1 ile 10 arasında olmalı")
    comment: str = Field(..., min_length=3, max_length=1000, description="Yorum metni")

# --- OLUŞTURMA ŞEMASI (Create) ---
# Kullanıcıdan (Frontend/Postman) gelen veri.
# movie_id URL'den alınacak, user_id token'dan alınacak.
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=10, description="Puan 1 ile 10 arasında olmalı")
    comment: str = Field(..., min_length=3, max_length=1000, description="Yorum metni")

# --- GÜNCELLEME ŞEMASI (Update) ---
# Kullanıcı yorumunu düzenlerse sadece bu alanlar değişebilir.
class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=10)
    comment: Optional[str] = Field(None, min_length=3, max_length=1000)

# --- VERİTABANI/YANIT ŞEMASI (Response/DB) ---
# Veritabanından okuyup kullanıcıya gösterdiğimiz tam hali.
class ReviewResponse(ReviewBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    movie_id: str
    user_id: str  # Bu yorumu kim yazdı?
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Pydantic v2 Config
    model_config = ConfigDict(
        populate_by_name=True,       # _id alanını id olarak kullanabilmek için
        arbitrary_types_allowed=True, # ObjectId gibi tiplere izin ver
        json_schema_extra={
            "example": {
                "rating": 8,
                "comment": "Mükemmel bir filmdi, kesinlikle izleyin.",
                "movie_id": "656a1b2c3d4e5f6g7h8i9j0k",
                "user_id": "user123_id_string"
            }
        }
    )