from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restx import Api
from flask_session import Session

db = SQLAlchemy()
migrate = Migrate()
api = Api(
    title='API do Sistema de Gerenciamento Financeiro',
    version='1.0',
    description='API criada para gerenciamento de finanças de um comércio',
    doc='/swagger/'
)
sess = Session()