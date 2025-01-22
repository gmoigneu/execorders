from sqlalchemy.orm import Session
import re
from pathlib import Path
import sys

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))


from database import SessionLocal, engine

from models.order import Order

def slugify(text):
    if not text:
        return None
    # Convert to lowercase
    text = text.lower()
    # Replace spaces with hyphens
    text = re.sub(r'[\s]+', '-', text)
    # Remove all non-word characters (except hyphens)
    text = re.sub(r'[^\w\-]', '', text)
    # Clean up multiple hyphens
    text = re.sub(r'-+', '-', text)
    # Remove leading/trailing hyphens
    text = text.strip('-')
    return text

def generate_unique_slug(session: Session, base_slug: str) -> str:
    if not base_slug:
        return None
        
    slug = base_slug
    counter = 1
    while session.query(Order).filter(Order.slug == slug).first() is not None:
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug

def main():
    db = SessionLocal()
    try:
        # Get all orders without slugs
        orders = db.query(Order).filter(Order.slug.is_(None)).all()
        print(f"Found {len(orders)} orders without slugs")

        for order in orders:
            base_slug = slugify(order.title)
            if base_slug:
                unique_slug = generate_unique_slug(db, base_slug)
                if unique_slug:
                    order.slug = unique_slug
                    print(f"Generated slug '{unique_slug}' for order {order.id}")
            
        db.commit()
        print("Finished generating slugs")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main() 