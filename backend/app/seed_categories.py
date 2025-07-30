from app import create_app
from app.extensions import db
from app.models.category import Category
from app.models.transaction import TransactionType

app = create_app()

# Run with: python -m app.seed_categories

# Listas fornecidas
income_categories = [
    "Reparo de pneu - Moto",
    "Reparo de pneu - Carro",
    "Reparo de pneu - Bicicleta",
    "Troca de pneu - Moto",
    "Troca de pneu - Carro",
    "Carga em Bateria",
    "Outros"
]

expense_categories = [
    "MEI",
    "Mercado",
    "Boleto",
    "Internet",
    "Gasolina",
    "Academia",
    "Farmácia",
    "Outros"
]

def insert_categories():
    with app.app_context():
        all_inserted = 0

        for name in set(income_categories):
            if not Category.query.filter_by(name=name, type=TransactionType.INCOME).first():
                db.session.add(Category(name=name, type=TransactionType.INCOME))
                all_inserted += 1

        for name in set(expense_categories):
            if not Category.query.filter_by(name=name, type=TransactionType.EXPENSE).first():
                db.session.add(Category(name=name, type=TransactionType.EXPENSE))
                all_inserted += 1

        db.session.commit()
        print(f"✅ Inserção concluída. {all_inserted} novas categorias adicionadas.")

if __name__ == "__main__":
    insert_categories()
