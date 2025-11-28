from fastapi import APIRouter, Depends, HTTPException
from app.services.movies.models import MovieModel

router = APIRouter()

@router.get("/{movie_id}", response_model=MovieModel)
async def get_movie(movie_id: str):
    # Burada movie_id'ye göre veritabanından film bilgisi çekilecek
    # Örnek bir yanıt döndürüyoruz
    if movie_id != "1":
        raise HTTPException(status_code=404, detail="Movie not found")
    
    return MovieModel(
        id="1",
        title="Inception",
        director="Christopher Nolan",
        year=2010,
        rating=8.8,
        description="A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    )