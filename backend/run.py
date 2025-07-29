from app import create_app, db
from app.models import category, transaction

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Category': category.Category, 'Transaction': transaction.Transaction}

if __name__ == '__main__':
    app.run(debug=True)