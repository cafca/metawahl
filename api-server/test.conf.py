import os

ADMIN_KEY = os.environ.get("METAWAHL_ADMIN_KEY", "admin_key")
DEBUG = False
SECRET_KEY = os.environ.get("METAWAHL_SECRET", "server secret")
SQLALCHEMY_DATABASE_URI = 'postgresql:///metawahl'

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False
SQLALCHEMY_RECORD_QUERIES = False
