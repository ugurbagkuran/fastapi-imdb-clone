from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional 
from enum import Enum
from datetime import datetime



class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=15)
    password: str = Field(..., min_length=6)
    # role: UserRole = UserRole.USER
    

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    

class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[UserRole] = None
    

class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    email: EmailStr
    username: str
    is_active: bool
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )