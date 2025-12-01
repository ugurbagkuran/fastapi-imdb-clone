# app/services/auth/utils.py

from typing import Optional, Annotated
from bson import ObjectId
from pymongo.database import Database

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt

from app.core.security import (
    oauth2_scheme,
    verify_password,
    get_password_hash,
    SECRET_KEY,
    ALGORITHM,
)
# MongoDB için uyarlanmış get_db (örneğin, from app.database import get_db)
from app.database import get_db  # Bu artık MongoDB Database döndürmeli

from . import schemas  # models import'u kaldırıldı, dict kullanacağız


# ---- Basit yardımcı fonksiyonlar ----

def get_user_by_email(db: Database, email: str) -> Optional[dict]:
    """E-posta ile kullanıcıyı bul."""
    return db.users.find_one({"email": email})


def create_user(db: Database, user_in: schemas.UserCreate) -> dict:
    """
    Yeni kullanıcı oluştur.
    E-posta doğrulama vs. yok. Direkt aktif kullanıcı oluşturuyoruz.
    """
    # Daha önce kayıtlı mı kontrol (opsiyonel ama mantıklı)
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta ile kayıtlı bir kullanıcı zaten var.",
        )

    hashed_pw = get_password_hash(user_in.password)

    user_doc = {
        "email": user_in.email,
        "username": user_in.username,
        "hashed_password": hashed_pw,
        "is_active": True,
    }
    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


def authenticate_user(db: Database, email: str, password: str) -> Optional[dict]:
    """
    Login için kullanıcı doğrulama.
    E-posta + şifre doğruysa kullanıcıyı döner, yanlışsa None.
    """
    user = get_user_by_email(db, email=email)
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


def get_current_user(
    db: Annotated[Database, Depends(get_db)],
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

    user = db.users.find_one({"_id": user_id})
    if user is None:
        raise _credentials_exception

    return user


def get_current_active_user(
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
