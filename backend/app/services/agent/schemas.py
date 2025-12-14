from pydantic import BaseModel, Field
from typing import List, Optional, Dict
class Message(BaseModel):
    role: str = Field(..., pattern="^(user|ai|assistant)$", description="Mesajı gönderen: 'user' veya 'ai'")
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = Field(default=[], description="Sohbet geçmişi (Context için)")

class ChatResponse(BaseModel):
    response: str