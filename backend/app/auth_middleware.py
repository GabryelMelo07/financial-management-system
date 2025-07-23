from flask import request, jsonify, session

def auth_required():
    """Middleware de autenticação compatível com before_request"""
    # Rotas públicas
    public_routes = [
        '/auth/login', 
        '/swagger', 
        '/swagger/', 
        '/swagger.json'
    ]
    
    # Verificar se a rota atual é pública
    if request.path in public_routes:
        return None
    
    # Verificar autenticação
    if not session.get('user_id'):
        return jsonify({'message': 'Authentication required'}), 401
    
    return None