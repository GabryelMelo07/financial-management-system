from flask_restx import fields
from app.extensions import api
from app.models.category import CategoryType
from app.models.transaction import PaymentMethod, TransactionType

transaction_model = api.model('Transaction', {
    'id': fields.Integer(readonly=True),
    'amount': fields.Float(required=True),
    'transaction_type': fields.String(
        required=True, 
        enum=[t.value for t in TransactionType]
    ),
    'payment_method': fields.String(
        required=True, 
        enum=[m.value for m in PaymentMethod]
    ),
    'description': fields.String(),
    'transaction_date': fields.DateTime(required=True),
    'category_id': fields.Integer(required=True)
})

category_model = api.model('Category', {
    'id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'type': fields.String(required=True, enum=[t.value for t in CategoryType])
})

pagination_model = api.model('Pagination', {
    'total_pages': fields.Integer,
    'current_page': fields.Integer,
    'per_page': fields.Integer,
    'total_items': fields.Integer
})

transaction_list_model = api.model('TransactionList', {
    'transactions': fields.List(fields.Nested(transaction_model)),
    'pagination': fields.Nested(pagination_model)
})

api.models[transaction_model.name] = transaction_model
api.models[pagination_model.name] = pagination_model
api.models[transaction_list_model.name] = transaction_list_model