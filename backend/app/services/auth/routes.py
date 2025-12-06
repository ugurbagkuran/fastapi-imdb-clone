from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_database
from app.core.security import create_access_token  # security'den import et
from .utils import authenticate_user, create_user, get_current_user
from .schemas import UserCreate, UserLogin, Token, UserResponse


router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def register_user(user_in: UserCreate, db=Depends(get_database)):
    """Yeni kullanıcı kaydı."""
    return await create_user(db, user_in)


@router.post("/login", response_model=Token)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db=Depends(get_database)
):
    """Kullanıcı girişi (Swagger uyumlu)."""
    user = await authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Giriş yapmış kullanıcının bilgilerini döndürür."""
    return UserResponse(
        _id=str(current_user["_id"]),
        email=current_user["email"],
        username=current_user["username"],
        is_active=current_user["is_active"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

