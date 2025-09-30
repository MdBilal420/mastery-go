from pydantic import BaseModel
from typing import List, Optional

class RoleplayOpenRequest(BaseModel):
    book: str
    chapter: str
    profile: str

class RoleplayResponse(BaseModel):
    text: str
    audio_b64: str

class Turn(BaseModel):
    speaker: str
    text: str

class FeedbackResponse(BaseModel):
    summary: str
    score: int
    suggestions: List[str]

class Context(BaseModel):
    book: Optional[str]
    chapter: Optional[str]
    profile: Optional[str]