from datetime import datetime
from app.extensions import db
from enum import Enum as PyEnum
from sqlalchemy import Enum

class TransactionType(PyEnum):
    INCOME = 'income'
    EXPENSE = 'expense'

class PaymentMethod(PyEnum):
    PIX = 'pix'
    CARD = 'card'
    CASH = 'cash'

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(
        Enum(TransactionType), 
        nullable=False
    )
    payment_method = db.Column(
        Enum(PaymentMethod), 
        nullable=False
    )
    description = db.Column(db.String(255))
    transaction_date = db.Column(db.Date, default=datetime.now().date(), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    
    # Relacionamento
    category = db.relationship('Category', backref='transactions')