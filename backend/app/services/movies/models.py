from pydantic import BaseModel
from typing import Optional


class MovieModel(BaseModel):
    title: str
    description: Optional[str] = None
    director: Optional[str] = None
    year: Optional[int] = None
    rating: Optional[float] = None
    id: Optional[str] = None