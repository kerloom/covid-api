from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from settings import db

class Place(db.Model):
    __tablename__ = 'places'
    
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String)
    country = db.Column(db.String)
    province = db.Column(db.String)
    population = db.Column(db.Integer)
    hits = db.Column(db.Integer)

if __name__ == "__main__":
    db.create_all()