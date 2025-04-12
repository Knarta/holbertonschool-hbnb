from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.facade import HBnBFacade


api = Namespace('places', description='Place operations')

facade = HBnBFacade()

# Define the models for related entities
amenity_model = api.model('PlaceAmenity', {
    'id': fields.String(description='Amenity ID'),
    'name': fields.String(description='Name of the amenity')
})

user_model = api.model('PlaceUser', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(description='First name of the owner'),
    'last_name': fields.String(description='Last name of the owner'),
    'email': fields.String(description='Email of the owner')
})

# Define the place model for input validation and documentation
place_model = api.model('Place', {
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True,
                             description='Latitude of the place'),
    'longitude': fields.Float(required=True,
                              description='Longitude of the place'),
    'owner_id': fields.String(required=True,
                              description='ID of the owner'),
    'amenities': fields.List(fields.String, required=True,
                             description="List of amenities ID's")
})


@api.route('/')
class PlaceList(Resource):
    @api.expect(place_model)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        """Register a new place"""
        
        current_user = get_jwt_identity()
        place_data = api.payload
        place_data['owner_id'] = current_user['id']

        if not place_data:
            return {'message': 'Invalid input data'}, 400

        amenities = []

        if isinstance(place_data['amenities'], list):
            for amenity_id in place_data['amenities']:
                if not isinstance(amenity_id, str):
                    return {'error': 'Invalid amenity id format'}, 400
                amenity = facade.get_amenity(amenity_id)
                amenities.append(amenity)

        place_data['amenities'] = amenities

        try:
            new_place = facade.create_place(place_data)
            new_place.validate()
        except (TypeError, ValueError) as e:
            return {'error': str(e)}, 400
        
        return {
            "id": new_place.id,
            "title": new_place.title,
            "description": new_place.description,
            "price": new_place.price,
            "latitude": new_place.latitude,
            "longitude": new_place.longitude,
            "owner_id": new_place.owner_id,
            "amenities": new_place.amenities
        }, 201

    @api.response(200, 'List of places retrieved successfully')
    def get(self):
        """Retrieve a list of all places"""
        places = facade.get_all_places()
        return { 
            'places': [
                {
                    'id': places.id,
                    'title': places.title,
                    'description': places.description,
                    'price': places.price,
                    'latitude': places.latitude,
                    'longitude': places.longitude,
                    'owner_id': places.owner_id,
                    'amenities': places.amenities,
                    'image_url': places.image_url
                } for places in places
            ]
        }, 200

@api.route('/<place_id>')
class PlaceResource(Resource):
    @api.response(200, 'Place details retrieved successfully')
    @api.response(404, 'Place not found')
    @jwt_required()
    def get(self, place_id):
        """Get place details by ID"""
        place_data = facade.get_place(place_id)

        if not place_data:
            return {'error': 'Place not found'}, 404
        return {"id": place_data.id,
                "title": place_data.title,
                "description": place_data.description,
                "price": place_data.price,
                "latitude": place_data.latitude,
                "longitude": place_data.longitude,
                "owner_id": place_data.owner_id,
                "amenities": [{"id": a.id, "name": a.name} for a in place_data.amenities]}, 200

    @api.expect(place_model)
    @api.response(200, 'Place updated successfully')
    @api.response(404, 'Place not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    @jwt_required()
    def put(self, place_id):
        """Update a place's information"""
        place_data = api.payload

        if not place_data:
            return {'error': 'Invalid input place data'}, 400
        
        current_user = get_jwt_identity()
        place = facade.get_place(place_id)
        user_id = current_user.get('id')
        admin = current_user.get('is_admin')
        place.validate()

        if place.owner_id != user_id:
            return {'error': 'Unauthorized action : Cannot modify other user\'s places'}, 403
        if not admin:
            return {'error': 'Unauthorized action : Should be an admin'}, 403

        updated_place = facade.update_place(place_id, place_data)

        if not updated_place:
            return {'message': 'Place not found'}, 404
        return {"id": updated_place.id,
                "title": updated_place.title,
                "description": updated_place.description,
                "price": updated_place.price,
                "latitude": updated_place.latitude,
                "longitude": updated_place.longitude,
                "owner_id": updated_place.owner_id,
                "amenities": [{"id": a.id, "name": a.name} for a in updated_place.amenities]}, 200

@api.route('/<place_id>/amenities')
class PlaceAmenities(Resource):
    @api.response(200, 'Place amenities retrieved successfully')
    @api.response(404, 'Place not found')
    @jwt_required()
    def get(self, place_id):
        """Get amenities for a specific place"""
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
        
        amenities = place.amenities
        return {'amenities': [{"id": a.id, "name": a.name} for a in amenities]}, 200

@api.route('/<place_id>/reviews')
class PlaceReviews(Resource):
    @api.response(200, 'Place reviews retrieved successfully')
    @api.response(404, 'Place not found')
    @jwt_required()
    def get(self, place_id):
        """Get reviews for a specific place"""
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
        
        reviews = place.reviews
        return {'reviews': [{
            "id": r.id,
            "text": r.text,
            "rating": r.rating,
            "user_id": r.user_id,
            "place_id": r.place_id
        } for r in reviews]}, 200
