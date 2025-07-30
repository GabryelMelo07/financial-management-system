import difflib
import sqlite3
from datetime import datetime
from app import create_app
from app.extensions import db
from app.models.transaction import Transaction, TransactionType, PaymentMethod
from app.models.category import Category

# Run with: python -m app.import_old_data

# Categorias definidas
income_categories = [
    "Reparo de pneu - Moto",
    "Reparo de pneu - Carro",
    "Reparo de pneu - Bicicleta",
    "Troca de pneu - Moto",
    "Troca de pneu - Carro",
    "Carga em Bateria"
]

expense_categories = [
    "MEI",
    "Mercado",
    "Boleto",
    "Internet",
    "Gasolina",
    "Academia",
    "Farmácia"
]

# Conecta ao Flask App
app = create_app()

sqlite_path = "C:/Users/Gabryel Melo/Desktop/db.sqlite3"  # exemplo: "old_data.db"

# Fuzzy match: retorna categoria mais próxima
def match_categoria(descricao, categorias):
    match = difflib.get_close_matches(descricao.lower(), [c.lower() for c in categorias], n=1, cutoff=0.5)
    if match:
        for c in categorias:
            if c.lower() == match[0]:
                return c
    return None

# Buscar categoria "Outros" (já existente)
def get_categoria_outros(tipo: TransactionType):
    categoria = Category.query.filter_by(name="Outros", type=tipo).first()
    if not categoria:
        raise ValueError(f"❌ Categoria 'Outros' do tipo {tipo.value} não encontrada no banco.")
    return categoria

def migrate_data():
    conn = sqlite3.connect(sqlite_path)
    cursor = conn.cursor()

    cursor.execute("SELECT id, descricao, valor, data_hora, tipo, forma_pagamento FROM movimentacoes_movimentacao ORDER BY data_hora ASC")
    rows = cursor.fetchall()

    with app.app_context():
        inserted = 0
        for row in rows:
            id_antigo, descricao, valor, data_iso, tipo, forma_pgto = row

            try:
                data_formatada = datetime.fromisoformat(data_iso).date()
            except Exception:
                print(f"⚠️ Data inválida em ID {id_antigo}: {data_iso}")
                continue

            try:
                tipo_map = {
                    "ENTRADA": TransactionType.INCOME,
                    "SAÍDA": TransactionType.EXPENSE
                }
                
                trans_type = tipo_map.get(tipo.upper())
            except KeyError:
                print(f"❌ Tipo inválido em ID {id_antigo}: {tipo}")
                continue

            categorias_base = income_categories if trans_type == TransactionType.INCOME else expense_categories
            categoria_nome = match_categoria(descricao, categorias_base)

            if categoria_nome:
                categoria = Category.query.filter_by(name=categoria_nome, type=trans_type).first()
                if not categoria:
                    print(f"⚠️ Categoria '{categoria_nome}' não encontrada no banco. Usando 'Outros'.")
                    categoria = get_categoria_outros(trans_type)
            else:
                print(f"⚠️ Nenhuma categoria compatível para '{descricao}'. Usando 'Outros'.")
                categoria = get_categoria_outros(trans_type)

            try:
                pgto_enum = PaymentMethod[forma_pgto.upper()]
            except KeyError:
                pgto_enum = PaymentMethod.CASH

            nova = Transaction(
                amount=valor,
                transaction_type=trans_type,
                payment_method=pgto_enum,
                description=descricao,
                transaction_date=data_formatada,
                category=categoria
            )
            db.session.add(nova)
            inserted += 1

        db.session.commit()
        print(f"\n✅ {inserted} transações migradas com sucesso.")

if __name__ == "__main__":
    migrate_data()
