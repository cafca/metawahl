import os

ADMIN_KEY = os.environ.get("METAWAHL_ADMIN_KEY", "server secret")
DEBUG = False
SECRET_KEY = os.environ.get("METAWAHL_SECRET", "server secret")
SQLALCHEMY_DATABASE_URI = os.environ.get(
    "METAWAHL_DB_URL", "postgresql:///metawahl"
)

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False
SQLALCHEMY_RECORD_QUERIES = False

CACHE_TYPE = "RedisCache"
CACHE_DEFAULT_TIMEOUT = 24 * 60 * 60
CACHE_REDIS_URL = os.environ.get("CACHE_REDIS_URL", "redis://127.0.0.1:6379/0")

METAWAHL_API_LOGFILE = os.environ.get(
    "METAWAHL_API_LOGFILE", "/var/log/metawahl/flask.log"
)

if SECRET_KEY == "server secret":
    print("Set server secret key environment variable METAWAHL_SECRET!")

if ADMIN_KEY == "server secret":
    print("Set admin key environment variable ADMIN_KEY!")
