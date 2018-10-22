#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Logger service ."""


import os

import config
from .helper import setup_logger

logfile = os.getenv("METAWAHL_API_LOGFILE", config.LOG_FILENAME)
logger = setup_logger(logfile=logfile, level=config.LOG_LEVEL)
setup_logger(name="werkzeug")
