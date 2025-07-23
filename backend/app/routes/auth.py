from flask import request, session
from flask_restx import Resource, Namespace
from app.models.user import User
from app.schemas.user_schema import login_model

ns = Namespace('auth', description='Operações de autenticação')

@ns.route('/login')
class Login(Resource):
    @ns.expect(login_model)
    def post(self):
        data = request.json
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            session['user_id'] = user.id
            return {'message': 'Login realizado com sucesso'}, 200
        return {'message': 'Credenciais inválidas'}, 401

@ns.route('/logout')
class Logout(Resource):
    def post(self):
        session.pop('user_id', None)
        return {'message': 'Logout realizado'}, 200