from flask import request
from flask_restx import Resource, Namespace, abort
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.schemas import transaction_model, transaction_list_model
from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, or_

ns = Namespace('transactions', description='Transactions operations')

@ns.route('/recent')
class RecentTransactions(Resource):
    @ns.marshal_list_with(transaction_model)
    def get(self):
        """Get last 5 transactions"""
        return Transaction.query\
            .order_by(Transaction.id.desc())\
            .limit(5)\
            .all()
    

@ns.route('/summary')
class MonthlySummary(Resource):
    def get(self):
        """Get financial summary (daily or monthly based on 'type' query param)"""
        summary_type = request.args.get('type', 'monthly')
        now = datetime.now().date()

        def get_sum(transaction_type, start, end):
            return db.session.query(func.sum(Transaction.amount)).filter(
                Transaction.transaction_type == transaction_type,
                Transaction.transaction_date >= start,
                Transaction.transaction_date <= end
            ).scalar() or 0.0
        
        def calc_diff(current, previous):
            if previous == 0:
                if current == 0:
                    return 0.0
                return 100.0 if current > 0 else -100.0
            return round(((current - previous) / abs(previous)) * 100, 2)

        if summary_type == 'daily':
            start_date = end_date = now
            income = get_sum('income', start_date, end_date)
            expense = get_sum('expense', start_date, end_date)
            net_profit = income - expense
            profit_margin = round((net_profit / income) * 100, 2) if income else 0.0

            return {
                'type': summary_type,
                'start_date': str(start_date),
                'end_date': str(end_date),
                'total_income': round(income, 2),
                'total_expense': -round(expense, 2),
                'net_profit': round(net_profit, 2),
                'profit_margin_percent': profit_margin
            }
        elif summary_type == 'monthly':
            start_date = datetime(now.year, now.month, 1).date()
            if now.month == 12:
                next_month = datetime(now.year + 1, 1, 1).date()
            else:
                next_month = datetime(now.year, now.month + 1, 1).date()
            end_date = next_month - timedelta(days=1)

            if now.month == 1:
                prev_month = 12
                prev_year = now.year - 1
            else:
                prev_month = now.month - 1
                prev_year = now.year
            prev_start_date = datetime(prev_year, prev_month, 1).date()
            if prev_month == 12:
                next_of_prev = datetime(prev_year + 1, 1, 1).date()
            else:
                next_of_prev = datetime(prev_year, prev_month + 1, 1).date()
            prev_end_date = next_of_prev - timedelta(days=1)

            income = get_sum('income', start_date, end_date)
            expense = get_sum('expense', start_date, end_date)
            net_profit = income - expense
            profit_margin = round((net_profit / income) * 100, 2) if income else 0.0

            prev_income = get_sum('income', prev_start_date, prev_end_date)
            prev_expense = get_sum('expense', prev_start_date, prev_end_date)
            prev_net_profit = prev_income - prev_expense
            prev_profit_margin = round((prev_net_profit / prev_income) * 100, 2) if prev_income else 0.0

            return {
                'type': summary_type,
                'start_date': str(start_date),
                'end_date': str(end_date),
                'total_income': round(income, 2),
                'total_expense': -round(expense, 2),
                'net_profit': round(net_profit, 2),
                'profit_margin_percent': profit_margin,
                'differences': {
                    'income_percent_change': calc_diff(income, prev_income),
                    'expense_percent_change': calc_diff(expense, prev_expense),
                    'net_profit_percent_change': calc_diff(net_profit, prev_net_profit),
                    'profit_margin_percent_change': calc_diff(profit_margin, prev_profit_margin),
                }
            }
        else:
            abort(400, message="Tipo de resumo inválido. Use 'daily' ou 'monthly'.")

@ns.route('/charts')
class ChartData(Resource):
    def get(self):
        """Get chart data for monthly and annual financial summary"""
        now = datetime.now()
        year = now.year
        month = now.month

        start_of_month = datetime(year, month, 1)
        if month == 12:
            end_of_month = datetime(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_of_month = datetime(year, month + 1, 1) - timedelta(days=1)

        daily_data = db.session.query(
            func.date(Transaction.transaction_date).label('date'),
            Transaction.transaction_type,
            func.sum(Transaction.amount).label('total')
        ).filter(
            Transaction.transaction_date >= start_of_month,
            Transaction.transaction_date <= end_of_month
        ).group_by(
            func.date(Transaction.transaction_date),
            Transaction.transaction_type
        ).all()

        monthly_chart = {}
        for day in range(1, end_of_month.day + 1):
            day_str = f"{day:02}"
            monthly_chart[day_str] = {'incomes': 0.0, 'expenses': 0.0}

        for row in daily_data:
            day_str = f"{row.date.day:02}"
            total = round(float(row.total), 2)
            if row.transaction_type == TransactionType.INCOME:
                monthly_chart[day_str]['incomes'] += total
            elif row.transaction_type == TransactionType.EXPENSE:
                monthly_chart[day_str]['expenses'] += total

        monthly_aggregate = db.session.query(
            func.extract('month', Transaction.transaction_date).label('month'),
            Transaction.transaction_type,
            func.sum(Transaction.amount).label('total')
        ).filter(
            func.extract('year', Transaction.transaction_date) == year
        ).group_by(
            func.extract('month', Transaction.transaction_date),
            Transaction.transaction_type
        ).all()

        month_names = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ]

        annual_chart = {name: {'incomes': 0.0, 'expenses': 0.0} for name in month_names}

        for row in monthly_aggregate:
            month_index = int(row.month) - 1
            name = month_names[month_index]
            total = round(float(row.total), 2)
            if row.transaction_type == TransactionType.INCOME:
                annual_chart[name]['incomes'] += total
            elif row.transaction_type == TransactionType.EXPENSE:
                annual_chart[name]['expenses'] += total

        category_totals = db.session.query(
            Category.name,
            Transaction.transaction_type,
            func.sum(Transaction.amount).label('total')
        ).join(Category, Category.id == Transaction.category_id)\
        .filter(
            Transaction.transaction_date >= start_of_month,
            Transaction.transaction_date <= end_of_month
        ).group_by(
            Category.name,
            Transaction.transaction_type
        ).all()

        income_totals = {}
        expense_totals = {}
        total_income = 0.0
        total_expense = 0.0

        for category_name, tx_type, total in category_totals:
            total = float(total)
            if tx_type == TransactionType.INCOME:
                income_totals[category_name] = income_totals.get(category_name, 0.0) + total
                total_income += total
            elif tx_type == TransactionType.EXPENSE:
                expense_totals[category_name] = expense_totals.get(category_name, 0.0) + total
                total_expense += total

        def percent_dict(data, total):
            return {
                name: round((value / total) * 100, 2)
                for name, value in data.items()
                if total > 0
            }

        incomes_pie_chart = percent_dict(income_totals, total_income)
        expenses_pie_chart = percent_dict(expense_totals, total_expense)

        return {
            'monthlyChart': monthly_chart,
            'annualChart': annual_chart,
            'incomesPieChart': incomes_pie_chart,
            'expensesPieChart': expenses_pie_chart
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

        query = query.order_by(Transaction.id.desc())

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

        try:
            transaction_type_enum = TransactionType[data['transaction_type'].upper()]
        except KeyError:
            abort(400, message=f"Tipo de transação inválido: {data['transaction_type']}")

        category = Category.query.get_or_404(data['category_id'])

        if transaction_type_enum != category.type:
            abort(400, message="Tipo de categoria é diferente do tipo da transação")

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
    
@ns.route('/<int:id>')
@ns.param('id', 'The transaction identifier')
class TransactionDetail(Resource):
    def delete(self, id):
        """Delete a transaction by ID"""
        transaction = Transaction.query.get_or_404(id)

        db.session.delete(transaction)
        db.session.commit()

        return {'message': f'Transação com id {id} foi deletada com sucesso.'}, 200

    @ns.expect(transaction_model)
    @ns.marshal_with(transaction_model)
    def put(self, id):
        """Update a transaction by ID"""
        transaction = Transaction.query.get_or_404(id)
        data = ns.payload

        try:
            transaction_type_enum = TransactionType[data['transaction_type'].upper()]
        except KeyError:
            abort(400, message=f"Tipo de transação inválido: {data['transaction_type']}")

        category = Category.query.get_or_404(data['category_id'])

        if transaction_type_enum != category.type:
            abort(400, message="Tipo de categoria é diferente do tipo da transação")

        transaction.amount = data['amount']
        transaction.transaction_type = data['transaction_type']
        transaction.payment_method = data['payment_method']
        transaction.description = data.get('description', '')
        transaction.transaction_date = data.get('transaction_date', datetime.now().date())
        transaction.category_id = data['category_id']

        db.session.commit()

        return transaction