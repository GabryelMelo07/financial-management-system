from flask import request, session
from flask_restx import Resource, Namespace, fields, abort
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.schemas.transaction_schema import transaction_model, category_model
from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, or_
from app.schemas.transaction_schema import transaction_list_model

ns = Namespace('transactions', description='Transactions operations')

@ns.route('/recent')
class RecentTransactions(Resource):
    @ns.marshal_list_with(transaction_model)
    def get(self):
        """Get last 5 transactions"""
        return Transaction.query\
            .order_by(Transaction.transaction_date.desc())\
            .limit(5)\
            .all()
    

@ns.route('/summary')
class MonthlySummary(Resource):
    def get(self):
        """Get monthly financial summary"""
        now = datetime.now().date()
        first_day_of_month = datetime(now.year, now.month, 1)
        last_day_of_month = datetime(now.year, now.month + 1, 1) - timedelta(days=1)
        
        # Calcular receitas
        income = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.transaction_type == 'income',
            Transaction.transaction_date >= first_day_of_month,
            Transaction.transaction_date <= last_day_of_month
        ).scalar() or 0.0
        
        # Calcular despesas
        expense = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.transaction_type == 'expense',
            Transaction.transaction_date >= first_day_of_month,
            Transaction.transaction_date <= last_day_of_month
        ).scalar() or 0.0
        
        return {
            'total_income': round(income, 2),
            'total_expense': round(expense, 2),
            'net_profit': round(income - expense, 2)
        }

@ns.route('/')
class TransactionList(Resource):
    @ns.marshal_list_with(transaction_list_model)
    def get(self):
        """List transactions with pagination and filters"""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 30, type=int)
        
        query = Transaction.query.join(Category)
        
        # Filtros
        transaction_type = request.args.get('type')
        if transaction_type in [t.value for t in TransactionType]:
            query = query.filter(Transaction.transaction_type == transaction_type)
            
        category_id = request.args.get('category_id')
        if category_id:
            query = query.filter(Transaction.category_id == category_id)
            
        search_query = request.args.get('search')
        if search_query:
            query = query.filter(
                or_(
                    Transaction.description.ilike(f'%{search_query}%'),
                    Category.name.ilike(f'%{search_query}%')  # Busca por nome de categoria
                )
            )

        query = query.order_by(Transaction.transaction_date.desc())

        paginated = query.paginate(
            page=page, 
            per_page=per_page,
            error_out=False
        )
        
        return {
            'transactions': paginated.items,
            'pagination': {
                'total_pages': paginated.pages,
                'current_page': paginated.page,
                'per_page': paginated.per_page,
                'total_items': paginated.total
            }
        }

    @ns.expect(transaction_model)
    @ns.marshal_with(transaction_model, code=201)
    def post(self):
        """Create a new transaction"""
        data = ns.payload

        category = Category.query.get_or_404(data['category_id'])
        if data['transaction_type'] != category.type:
            abort(400, message=f"Tipo de categoria é diferente do tipo da transação")

        new_transaction = Transaction(
            amount=data['amount'],
            transaction_type=data['transaction_type'],
            payment_method=data['payment_method'],
            description=data.get('description', ''),
            transaction_date=data.get('transaction_date', datetime.now().date()),
            category_id=data['category_id']
        )
        db.session.add(new_transaction)
        db.session.commit()
        return new_transaction, 201