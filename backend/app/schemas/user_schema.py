from flask_restx import fields
from app.extensions import api

user_model = api.model('User', {
    'id': fields.Integer(readonly=True),
    'username': fields.String(required=True)
})

login_model = api.model('Login', {
    'username': fields.String(required=True),
    'password': fields.String(required=True, min_length=6)
})