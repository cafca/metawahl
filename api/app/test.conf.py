import os

ADMIN_KEY = os.environ.get("METAWAHL_ADMIN_KEY", "admin_key")
DEBUG = False
TESTING = True
SECRET_KEY = os.environ.get("METAWAHL_SECRET",
    b"'V\x8a\x0f\x9d\xae}\xcdM\xce*\xd9QU/\t")
SQLALCHEMY_DATABASE_URI = 'postgresql:///metawahl'

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False
SQLALCHEMY_RECORD_QUERIES = False

CACHE_TYPE = "simple"
