from typing import Union, List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from models.order import Order
from schemas.order import OrderIndex, OrderShow
from database import get_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = next(get_db())
load_dotenv()


@app.get("/", response_model=dict[str, Union[List[OrderIndex], dict]])
def index_orders(page: int = 1, per_page: int = 10):
    # Calculate offset based on page and per_page
    offset = (page - 1) * per_page
    
    # Get total count for pagination metadata
    total = db.query(Order).count()
    
    # Get paginated orders
    orders = db.query(Order).order_by(Order.published_at.desc()).offset(offset).limit(per_page).all()
    
    # Calculate total pages
    total_pages = (total + per_page - 1) // per_page
    
    meta = {
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages
    }
    return {"orders": orders, "meta": meta}


@app.get("/{slug}", response_model=OrderShow)
def show_order(slug: str):
    order = db.query(Order).filter(Order.slug == slug).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order