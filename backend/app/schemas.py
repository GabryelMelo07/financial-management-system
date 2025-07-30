from flask_restx import fields
from app.extensions import api
from flask_restx.fields import Raw

class EnumField(Raw):
    def format(self, value):
        return value.value

category_model = api.model('Category', {
    'id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'type': EnumField(required=True, description="Tipo da categoria (income ou expense)")
})

transaction_model = api.model('Transaction', {
    'id': fields.Integer(readonly=True),
    'amount': fields.Float(required=True),
    'transaction_type': EnumField(required=True, description="Tipo da transação (income ou expense)"),
    'payment_method': EnumField(required=True, description="Método de pagamento (pix, card ou cash)"),
    'description': fields.String(),
    'transaction_date': fields.DateTime(required=True),
    'category': fields.Nested(category_model, description="Detalhes da categoria")
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