from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wolfram_queries.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app, resources={r"/api/*": {"origins": "*"}})
db = SQLAlchemy(app)

# TODO: https://stackoverflow.com/questions/24291933/sqlalchemy-object-already-attached-to-session