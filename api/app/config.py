import logging

API_NAME = "Metawahl API"
API_VERSION = "v2"
API_FULL_NAME = "{name} {version}".format(name=API_NAME, version=API_VERSION)
API_ROOT = "/api/{}".format(API_VERSION)

SITE_ROOT = "https://metawahl.de"

LOG_FILENAME = "../metawahl-api.log"
LOG_LEVEL = logging.DEBUG

CACHE_FILLER_LOG = "/var/log/metawahl/cache_filler.log"
CACHE_FILLER_LOG = "./cache_filler.log"
WIKIDATA_UPDATE_LOG = "../wikidata_update.log"
