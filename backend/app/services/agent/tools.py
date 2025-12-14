# backend/app/services/agent/tools.py

from typing import List, Optional
from langchain_core.tools import tool
from app.core.database import get_database
from app.services.movies.schemas import MovieCreate
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from fastembed import TextEmbedding
import numpy as np

# --- MODEL YÜKLEME (Lightweight / Hafif Versiyon) ---
# PyTorch yerine ONNX tabanlı FastEmbed kullanıyoruz.
# İlk çalıştırmada modeli indirir (~100MB), sonra cache'den kullanır.
import warnings

# Suppress FastEmbed UserWarning about pooling method
warnings.filterwarnings("ignore", message=".*uses mean pooling instead of CLS embedding.*")

embedding_model = TextEmbedding(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# --- YARDIMCI: EMBEDDING OLUŞTURUCU ---
def generate_embedding(text: str) -> List[float]:
    """
    Verilen metni vektöre çevirir.
    FastEmbed generator döndürdüğü için listeye çevirip ilk elemanı alıyoruz.
    """
    if not text:
        return []
    
    # FastEmbed liste kabul eder ve generator döner
    embeddings_generator = embedding_model.embed([text]) 
    return list(embeddings_generator)[0].tolist()

# --- TOOL 1: SEMANTİK (ANLAMSAL) ARAMA ---
@tool
async def semantic_search_movies(user_query: str, limit: int = 5) -> str:
    """
    Kullanıcının doğal dildeki isteğine göre filmleri 'anlamsal' olarak arar.
    Örnek: "Hapishaneden kaçışı anlatan hüzünlü filmler" veya "Uzayda geçen macera".
    """
    try:
        db = await get_database()
        
        query_vector = generate_embedding(user_query)
        
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",      
                    "path": "embedding",          
                    "queryVector": query_vector,  
                    "numCandidates": 100,         
                    "limit": limit                
                }
            },
            {
                "$project": {
                    "embedding": 0, 
                    "score": {"$meta": "vectorSearchScore"} 
                }
            }
        ]
        
        cursor = db["movies"].aggregate(pipeline)
        movies = await cursor.to_list(length=limit)

        if not movies:
            return "Aradığınız kriterlere anlamsal olarak yakın bir film bulunamadı."

        results = []
        for movie in movies:
            movie["_id"] = str(movie["_id"])
            results.append(movie)

        return str(results)

    except Exception as e:
        print(f"Vector Search failed (likely local MongoDB): {e}. Switching to In-Memory Fallback.")
        try:
            # FALLBACK: Tüm filmleri belleğe çek ve Cosine Similarity hesapla
            all_movies = await db["movies"].find({}, {"embedding": 1, "title": 1, "year": 1, "director": 1, "genre": 1, "poster_url": 1}).to_list(length=1000)
            
            if not all_movies:
                return "Henüz veritabanında hiç film yok."

            movie_embeddings = [m["embedding"] for m in all_movies if "embedding" in m]
            if not movie_embeddings:
                return "Filmlerin vektör verileri eksik."

            # Numpy ile hesaplama
            query_vec = np.array(query_vector)
            doc_vecs = np.array(movie_embeddings)

            # Cosine Similarity: (A . B) / (|A| * |B|)
            norm_query = np.linalg.norm(query_vec)
            norm_docs = np.linalg.norm(doc_vecs, axis=1)
            
            # Sıfıra bölmeyi engelle
            valid_indices = norm_docs > 0
            
            scores = np.zeros(len(doc_vecs))
            scores[valid_indices] = np.dot(doc_vecs[valid_indices], query_vec) / (norm_docs[valid_indices] * norm_query)

            # Skorları filmlerle eşleştir
            scored_movies = []
            for i, movie in enumerate(all_movies):
                # Embedding'i çıkar (sonuçta görünmesin)
                movie.pop("embedding", None)
                movie["score"] = float(scores[i])
                movie["_id"] = str(movie["_id"])
                scored_movies.append(movie)

            # Skora göre sırala (Büyükten küçüğe)
            scored_movies.sort(key=lambda x: x["score"], reverse=True)
            
            return str(scored_movies[:limit])

        except Exception as fallback_error:
            return f"Semantik arama sırasında kritik hata: {str(e)} -> Fallback hatası: {str(fallback_error)}"

# --- TOOL 2: FİLTRELİ ARAMA (Klasik) ---
@tool
async def search_movies_by_filter(
    title: Optional[str] = None,
    director: Optional[str] = None,
    genre: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = 5
) -> str:
    """Spesifik kriterlere (Yönetmen, Yıl, Tür, İsim) göre film arar."""
    try:
        db = await get_database()
        query = {}

        if title:
            query["title"] = {"$regex": title, "$options": "i"}
        if director:
            query["director"] = {"$regex": director, "$options": "i"}
        if genre:
            query["genre"] = {"$regex": genre, "$options": "i"}
        if year:
            query["year"] = year

        movies = await db["movies"].find(query, {"embedding": 0}).limit(limit).to_list(length=limit)

        if not movies:
            return "Kriterlere uygun film bulunamadı."

        for movie in movies:
            movie["_id"] = str(movie["_id"])

        return str(movies)

    except Exception as e:
        return f"Filtreli arama hatası: {str(e)}"

# --- TOOL 3: FİLM DETAYI ---
@tool
async def get_movie_details(movie_id: str) -> str:
    """ID'si bilinen bir filmin tüm detaylarını getirir."""
    try:
        db = await get_database()
        if not ObjectId.is_valid(movie_id):
            return "Geçersiz ID."

        movie = await db["movies"].find_one({"_id": ObjectId(movie_id)}, {"embedding": 0})
        if movie:
            movie["_id"] = str(movie["_id"])
            return str(movie)
        return "Film bulunamadı."
    except Exception as e:
        return f"Hata: {str(e)}"

from app.services.agent.context import user_context_var

# --- TOOL 4: FİLM EKLEME ---
@tool
async def add_movie(
    title: str,
    year: int,
    director: str,
    genre: List[str],
    description: str = "",
    cast: List[str] = [],
    poster_url: str = None
) -> str:
    """Yeni film ekler ve otomatik embedding oluşturur."""
    try:
        # 1. Yetki Kontrolü (ContextVar)
        current_user = user_context_var.get()
        
        if not current_user:
            return "Hata: Kullanıcı oturumu bulunamadı. Lütfen giriş yapın."
            
        # Admin kontrolü
        if current_user.get("role") != "admin":
             return f"Hata: Film ekleme yetkiniz yok! Rolünüz: {current_user.get('role', 'Bilinmiyor')}"

        db = await get_database()

        text_to_embed = f"{title} {director} {' '.join(genre)} {description}"
        vector =generate_embedding(text_to_embed)

        movie_in = MovieCreate(
            title=title,
            year=year,
            director=director,
            genre=genre,
            cast=cast,
            description=description,
            poster_url=poster_url
        )
        movie_data = jsonable_encoder(movie_in)
        movie_data["embedding"] = vector 
        
        # Ekleyen kişiyi de kaydedelim (Opsiyonel ama iyi olur)
        # movie_data["added_by"] = str(current_user["_id"])

        result = await db["movies"].insert_one(movie_data)
        return f"'{title}' başarıyla eklendi!"

    except Exception as e:
        return f"Ekleme hatası: {str(e)}"

tools_list = [semantic_search_movies, search_movies_by_filter, get_movie_details, add_movie]