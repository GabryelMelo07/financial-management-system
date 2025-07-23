from app.extensions import db
from app.models.transaction import TransactionType

CategoryType = TransactionType

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    type = db.Column(db.Enum(CategoryType), nullable=False)