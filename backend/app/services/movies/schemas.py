from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime

# MongoDB ObjectId'sini string'e çevirmek için helper
PyObjectId = Annotated[str, BeforeValidator(str)]

class MovieBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    year: int = Field(..., gt=1880, lt=2100)
    director: str = Field(..., min_length=2)
    genre: List[str] = Field(default=[])
    cast: List[str] = Field(default=[])
    description: Optional[str] = None
    average_rating: float = Field(default=0.0, ge=0, le=10)
    poster_url: Optional[str] = None
    similar_movies: List[PyObjectId] = []  # ObjectId'leri string'e çevir

class MovieCreate(MovieBase):
    pass

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    year: Optional[int] = None
    director: Optional[str] = None
    genre: Optional[List[str]] = None
    cast: Optional[List[str]] = None
    description: Optional[str] = None
    average_rating: Optional[float] = None
    similar_movies: Optional[List[str]] = None  # Güncelleme için de ekle

class MovieDB(MovieBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda dt: dt.isoformat()}
    )