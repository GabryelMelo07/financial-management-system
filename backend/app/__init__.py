from flask import Flask, jsonify, request
from flask_cors import CORS
from app.config import Config
from app.extensions import db, migrate, api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app)

    CORS(app)

    from app.routes.category import ns as category_ns
    from app.routes.transaction import ns as transaction_ns
    
    api.add_namespace(category_ns, path='/categories')
    api.add_namespace(transaction_ns, path='/transactions')

    @app.before_request
    def before_request():
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        if request.method == 'OPTIONS' or request.method == 'options':
            return jsonify(headers), 200
    
    return app