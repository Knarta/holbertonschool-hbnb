#!/usr/bin/python3

from app.models.base_model import BaseModel
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from .user import User
from app import db
import uuid

class Place(BaseModel):
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String, nullable=False)
    price = db.Column(db.Float, unique=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.String(36), ForeignKey('users.id'), nullable=False)  # Clé étrangère vers User
    user = db.relationship("User", back_populates="places")
    image_url = db.Column(LONGTEXT, nullable=True)

    # Relations
    reviews = db.relationship('Review', back_populates='place', lazy=True)  # One-to-Many avec Review
    amenities = db.relationship('Amenity', secondary='place_amenity', back_populates ='places', lazy=True)  # Many-to-Many avec Amenity


    @property
    def owner_id(self):
        return self.user_id

    @owner_id.setter
    def owner_id(self, owner_id):
        if not isinstance(owner_id, str):
            raise TypeError('owner must be a string')
        self.user_id = owner_id

    def add_review(self, review):
        """Add a review to the place."""
        self.reviews.append(review)
        self.save()

    def add_amenity(self, amenity):
        """Add an amenity to the place."""
        self.amenities.append(amenity)
        self.save()

    def validate(self):
        if self.latitude is None or not isinstance(self.latitude, float):
            raise TypeError('latitude must be a float')
        if self.latitude < -90.0 or self.latitude > 90.0:
            raise ValueError('latitude must be between -90 and 90')

        if self.longitude is None or not isinstance(self.longitude, float):
            raise TypeError('longitude must be a float')
        if self.longitude < -180.0 or self.longitude > 180.0:
            raise ValueError('longitude must be between -180 and 180')

        if self.owner_id == "" or not isinstance(self.owner_id, str):
            raise TypeError('owner must be a string')

        if self.price is None or not isinstance(self.price, float):
            raise TypeError('price must be a float')
        if self.price < 0:
            raise ValueError('price must be a positive float')

        if self.description is None or not isinstance(self.description, str):
            raise TypeError('description must be a non-empty string')

        if self.title is None or not isinstance(self.title, str):
            raise TypeError('title must be a non-empty string')
        if not self.title or len(self.title) > 100:
            raise ValueError('title must be 100 characters or less')