from fastapi import APIRouter, HTTPException, Body, status, Depends, Query
from fastapi.encoders import jsonable_encoder
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from bson.errors import InvalidId

from app.core.database import get_database
from .schemas import MovieCreate, MovieDB, MovieUpdate 

router = APIRouter()

# DÜZELTME: Veritabanı adını tekrar verilerin olduğu yere, "imdb_clone"a çektik.

# --- GET (Listeleme ve Arama) ---
@router.get("/", response_description="Filmleri listele ve filtrele", response_model=List[MovieDB])
async def list_movies(
    limit: int = 10, 
    skip: int = 0,
    title: Optional[str] = Query(None, description="Film adında arama yap"),
    director: Optional[str] = Query(None, description="Yönetmen adına göre filtrele"),
    year: Optional[int] = Query(None, description="Yapım yılına göre filtrele"),
    genre: Optional[str] = Query(None, description="Türe göre filtrele"),
    db: AsyncIOMotorClient = Depends(get_database)
):
    search_query = {}

    if title:
        search_query["title"] = {"$regex": title, "$options": "i"}
    if director:
        search_query["director"] = {"$regex": director, "$options": "i"}
    if year:
        search_query["year"] = year
    if genre:
        search_query["genre"] = genre

    # BURASI DÜZELDİ: imdb_clone
    movies_cursor = db["movies"].find(search_query).skip(skip).limit(limit)
    movies = await movies_cursor.to_list(length=limit)
    return movies

# --- POST (Oluşturma) ---
@router.post("/", response_description="Yeni film ekle", response_model=MovieDB, status_code=status.HTTP_201_CREATED)
async def create_movie(
    movie: MovieCreate = Body(...), 
    db: AsyncIOMotorClient = Depends(get_database)
):
    movie_data = jsonable_encoder(movie)
    # BURASI DÜZELDİ: imdb_clone
    new_movie = await db["movies"].insert_one(movie_data)
    
    # BURASI DÜZELDİ: imdb_clone
    created_movie = await db["movies"].find_one({"_id": new_movie.inserted_id})
    return created_movie

# --- GET (Tekil Detay) ---
@router.get("/{id}", response_description="Tek bir filmi getir", response_model=MovieDB)
async def show_movie(id: str, db: AsyncIOMotorClient = Depends(get_database)):
    try:
        oid = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Geçersiz ID formatı.")

    # BURASI DÜZELDİ: imdb_clone
    if (movie := await db["movies"].find_one({"_id": oid})) is not None:
        return movie
    
    raise HTTPException(status_code=404, detail=f"{id} ID'li film bulunamadı.")

# --- PUT (Güncelleme) ---
@router.put("/{id}", response_description="Filmi güncelle", response_model=MovieDB)
async def update_movie(
    id: str, 
    movie: MovieUpdate = Body(...), 
    db: AsyncIOMotorClient = Depends(get_database)
):
    try:
        oid = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Geçersiz ID formatı.")

    movie_data = {k: v for k, v in movie.model_dump(exclude_unset=True).items()}

    if len(movie_data) >= 1:
        # BURASI DÜZELDİ: imdb_clone
        update_result = await db["movies"].update_one(
            {"_id": oid}, {"$set": movie_data}
        )
        if update_result.modified_count == 1:
            if (updated_movie := await db["movies"].find_one({"_id": oid})) is not None:
                return updated_movie

    # BURASI DÜZELDİ: imdb_clone
    if (existing_movie := await db["movies"].find_one({"_id": oid})) is not None:
        return existing_movie

    raise HTTPException(status_code=404, detail=f"{id} ID'li film bulunamadı.")

# --- DELETE (Silme) ---
@router.delete("/{id}", response_description="Filmi sil")
async def delete_movie(id: str, db: AsyncIOMotorClient = Depends(get_database)):
    try:
        oid = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Geçersiz ID formatı.")
        
    # BURASI DÜZELDİ: imdb_clone
    delete_result = await db["movies"].delete_one({"_id": oid})

    if delete_result.deleted_count == 1:
        return {"message": "Film başarıyla silindi."}

    raise HTTPException(status_code=404, detail=f"{id} ID'li film bulunamadı.")