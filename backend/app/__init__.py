from flask import Flask
from app.auth_middleware import auth_required
from app.config import Config
from app.extensions import db, migrate, api, sess

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app)
    sess.init_app(app)
    
    app.before_request(auth_required)

    from app.routes.auth import ns as auth_ns
    from app.routes.user import ns as user_ns
    from app.routes.category import ns as category_ns
    from app.routes.transaction import ns as transaction_ns
    
    api.add_namespace(auth_ns, path='/auth')
    api.add_namespace(user_ns, path='/users')
    api.add_namespace(category_ns, path='/categories')
    api.add_namespace(transaction_ns, path='/transactions')
    
    return app