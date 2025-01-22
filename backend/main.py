from typing import Union, List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from models.order import Order
from schemas.order import OrderIndex, OrderShow
from database import get_db

app = FastAPI()

db = next(get_db())
load_dotenv()


@app.get("/", response_model=dict[str, Union[List[OrderIndex], dict]])
def index_orders(page: int = 1, per_page: int = 10):
    # Calculate offset based on page and per_page
    offset = (page - 1) * per_page
    
    # Get total count for pagination metadata
    total = db.query(Order).count()
    
    # Get paginated orders
    orders = db.query(Order).order_by(Order.created_at.desc()).offset(offset).limit(per_page).all()
    
    # Calculate total pages
    total_pages = (total + per_page - 1) // per_page
    
    meta = {
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages
    }
    return {"orders": orders, "meta": meta}


@app.get("/{order_id}", response_model=OrderShow)
def show_order(order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: Union[str, None] = None):
#     return {"item_id": item_id, "q": q}