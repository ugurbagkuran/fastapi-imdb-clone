from datetime import datetime, timedelta, timezone
from typing import Optional
from config import settings
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext

# ---- JWT ayarları ----
SECRET_KEY = settings.SECRET_KEY  # .env'den okumak daha iyi
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 saat

# Şifre hash için PassLib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 şeması
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


#kullanıcıdan girilen şifre ile veritabanındaki hashlenmiş şifreyi karşılaştırır
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


#parola hashleme
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Kullanıcı için JWT access token üretir.
    data içinde genelde {"sub": str(user.id)} gönderiyoruz.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
