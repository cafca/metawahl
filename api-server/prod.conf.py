import os

DEBUG = False
SECRET_KEY=os.environ.get("METAWAHL_SECRET", "server secret")
SQLALCHEMY_DATABASE_URI = 'sqlite:///./data/production.sqlite'

SQLALCHEMY_TRACK_MODIFICATIONS = True
SQLALCHEMY_ECHO = False
SQLALCHEMY_RECORD_QUERIES = False

if SECRET_KEY == "server secret":
  print('Set server secret key environment variable METAWAHL_SECRET!')
