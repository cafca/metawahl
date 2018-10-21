#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Setup Flask-RESTPlus API."""

from flask_restplus import Api

import config

api = Api(
    version=config.API_VERSION,
    title="Metawahl API",
    description="Provides tagged dataset of all Wahl-o-Mat theses, party positions and election results",
    license_url="https://github.com/ciex/metawahl/blob/master/LICENSE",
)
