from flask import session
from flask_restx import Resource, Namespace
from app.models.user import User
from app.schemas.user_schema import user_model
from app.extensions import db

ns = Namespace('users', description='Operações com usuários')

@ns.route('/')
class UserList(Resource):
    @ns.marshal_list_with(user_model)
    def get(self):
        return User.query.all()

@ns.route('/<int:id>')
class UserDetail(Resource):
    @ns.marshal_with(user_model)
    def get(self, id):
        return User.query.get_or_404(id)