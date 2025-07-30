from flask_restx import Resource, Namespace
from app.models.category import Category
from app.schemas import category_model
from app.extensions import db

ns = Namespace('categories', description='Category operations')

@ns.route('/')
class CategoryList(Resource):
    @ns.marshal_list_with(category_model)
    def get(self):
        """List all categories"""
        return Category.query.all()

    @ns.expect(category_model)
    @ns.marshal_with(category_model, code=201)
    def post(self):
        """Create a new category"""
        data = ns.payload
        new_category = Category(
            name=data['name'],
            type=data['type']
        )
        db.session.add(new_category)
        db.session.commit()
        return new_category, 201