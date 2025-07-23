import argparse
from app import create_app
from app.extensions import db
from app.models.user import User

def create_initial_user(username, password):
    app = create_app()
    
    with app.app_context():
        # Verificar se o usuário já existe
        if User.query.filter_by(username=username).first():
            print(f"⚠️ Usuário '{username}' já existe!")
            return False
        
        # Criar novo usuário
        new_user = User(username=username)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        print(f"✅ Usuário '{username}' criado com sucesso!")
        return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Criar usuário inicial')
    parser.add_argument('username', help='Nome de usuário')
    parser.add_argument('password', help='Senha do usuário')
    
    args = parser.parse_args()
    
    create_initial_user(args.username, args.password)