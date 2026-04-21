import os

ADMIN_KEY = os.environ.get("METAWAHL_ADMIN_KEY", "saltyBeaver")
DEBUG = True
SECRET_KEY = os.environ.get("METAWAHL_SECRET", "server development secret key")
SQLALCHEMY_DATABASE_URI = os.environ.get(
    "METAWAHL_DB_URL", "postgresql:///metawahl"
)
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False
SQLALCHEMY_RECORD_QUERIES = False

CACHE_TYPE = "null"

METAWAHL_API_LOGFILE = os.environ.get(
    "METAWAHL_API_LOGFILE", "/var/log/metawahl/flask.log"
)
