import os

DEBUG = True
SECRET_KEY="server development secret key"
SQLALCHEMY_DATABASE_URI = 'sqlite:///./data/development.sqlite'

SQLALCHEMY_TRACK_MODIFICATIONS = True
SQLALCHEMY_ECHO = False
SQLALCHEMY_RECORD_QUERIES = False
