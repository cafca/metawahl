import logging

API_NAME = "Metawahl API"
API_VERSION = "v2"
API_FULL_NAME = "{name} {version}".format(name=API_NAME, version=API_VERSION)
API_ROOT = "/api/{}".format(API_VERSION)

SITE_ROOT = "https://metawahl.de"

LOG_FILENAME = "../metawahl-api.log"
LOG_LEVEL = logging.DEBUG
