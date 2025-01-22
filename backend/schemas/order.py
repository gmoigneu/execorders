from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class OrderBase(BaseModel):
    id: int
    url: str
    slug: str
    title: Optional[str]
    excerpt: Optional[str]
    published_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class OrderIndex(OrderBase):
    """Order model for index view with limited fields"""
    pass

class OrderShow(OrderBase):
    """Order model for show view with all fields"""
    content: Optional[str]
    summary: Optional[str]
    explanation: Optional[str] 