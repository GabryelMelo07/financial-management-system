import os
from flask import Flask, jsonify, request, send_from_directory
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
    
    api.add_namespace(category_ns, path='/api/categories')
    api.add_namespace(transaction_ns, path='/api/transactions')

    @app.before_request
    def before_request():
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        if request.method == 'OPTIONS' or request.method == 'options':
            return jsonify(headers), 200
    
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    REACT_BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'frontend', 'dist'))
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        # Tenta servir arquivos estáticos primeiro
        if path != "" and os.path.exists(os.path.join(REACT_BUILD_DIR, path)):
            return send_from_directory(REACT_BUILD_DIR, path)
        
        # Serve o index.html para rotas do React
        if os.path.exists(os.path.join(REACT_BUILD_DIR, 'index.html')):
            return send_from_directory(REACT_BUILD_DIR, 'index.html')
        
        # Se não encontrar o index.html
        return jsonify({"error": "React build not found"}), 500

    @app.errorhandler(404)
    def not_found(e):
        if request.path.startswith('/api/'):
            return jsonify({"error": "API endpoint not found"}), 404
        return send_from_directory(REACT_BUILD_DIR, 'index.html')
    
    return app