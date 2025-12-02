# app/services/auth/utils.py

from typing import Optional, Annotated
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt

from app.core.security import (
    oauth2_scheme,
    verify_password,
    get_password_hash,
    SECRET_KEY,
    ALGORITHM,
)
from app.core.database import get_database

from . import schemas


# ---- Basit yardımcı fonksiyonlar ----

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[dict]:
    """E-posta ile kullanıcıyı bul."""
    return await db.users.find_one({"email": email})

async def get_user_by_username(db: AsyncIOMotorDatabase, username: str) -> Optional[dict]:
    """Kullanıcı adı ile kullanıcıyı bul."""
    return await db.users.find_one({"username": username})


async def create_user(db: AsyncIOMotorDatabase, user_in: schemas.UserCreate) -> dict:
    """
    Yeni kullanıcı oluştur.
    E-posta doğrulama vs. yok. Direkt aktif kullanıcı oluşturuyoruz.
    """
    # Önce e-posta  kontrolü
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta ile kayıtlı bir kullanıcı zaten var.",
        )
    # Sonra kullanıcı adı kontrolü
    existing = await get_user_by_username(db, user_in.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu kullanıcı adı zaten alınmış.",
        )

    hashed_pw = get_password_hash(user_in.password)

    user_doc = {
        "email": user_in.email,
        "username": user_in.username,
        "hashed_password": hashed_pw,
        "is_active": True,
        "role": schemas.UserRole.USER.value,  # Her zaman "user" - enum kullanarak
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    return user_doc


async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[dict]:
    """
    Login için kullanıcı doğrulama.
    E-posta + şifre doğruysa kullanıcıyı döner, yanlışsa None.
    """
    user = await get_user_by_email(db, email=email)
    if not user:
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    return user


# ---- Dependency fonksiyonları ----

_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Kimlik doğrulama başarısız.",
    headers={"WWW-Authenticate": "Bearer"},
)



async def get_current_user(
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> dict:
    """
    Header'daki Bearer token'dan kullanıcıyı bulur.
    Token'daki `sub` alanını user._id olarak kabul ediyoruz.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise _credentials_exception
        user_id = ObjectId(sub)
    except (JWTError, ValueError):
        # JWT bozuksa veya sub ObjectId'ye çevrilemiyorsa
        raise _credentials_exception

    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise _credentials_exception

    return user


async def get_current_active_user(
    current_user: Annotated[dict, Depends(get_current_user)]
) -> dict:
    """
    Kullanıcı aktif mi diye kontrol eder.
    (E-posta doğrulama vs. yok, sadece is_active alanına bakıyoruz.)
    """
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kullanıcı aktif değil.",
        )
    return current_user

# Sadece admin kullanıcıları geçiren dependency ---
async def get_current_admin_user(
    current_user: Annotated[dict, Depends(get_current_active_user)]
) -> dict:
    """Sadece admin kullanıcıları geçirir."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli.",
        )
    return current_user