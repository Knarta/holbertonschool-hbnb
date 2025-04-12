from flask import Flask
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

jwt = JWTManager()
bcrypt = Bcrypt()
db = SQLAlchemy()

from app.api.v1.auth import api as auth_ns
from app.api.v1.users import api as users_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.amenities import api as amenities_ns

def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS with specific configuration
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5501", "http://127.0.0.1:5501"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "Authorization"],
            "max_age": 3600
        }
    })
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = 'your-256-bit-secret-key-here'  # Change this to a secure secret key
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 86400  # 24 hours
    app.config['JWT_ALGORITHM'] = 'HS256'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    
    authorizations = {
        'token': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'Type in the *"Value"* input box below: **"Bearer <JWT>"**, where JWT is the token',
        }
    }
    api = Api(app, version='1.0', title='HBnB API', authorizations=authorizations, description='HBnB Application API', doc='/', security='BearerAuth')

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')

    # Initialiser SQLAlchemy et JWT sans le dossier `instance`
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)  # Initialiser Bcrypt dans l'application Flask
    with app.app_context():
        db.create_all()
    return app
