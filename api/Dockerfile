FROM python:3.8-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Build deps: psycopg2 needs libpq, pylibmc needs libmemcached, lxml needs libxml2/xslt.
# Keep build tools only during wheel build, then strip to shrink the layer.
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      libmemcached-dev \
      libxml2-dev \
      libxslt1-dev \
      zlib1g-dev \
      curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY api/requirements.txt /app/api/requirements.txt
RUN pip install -r /app/api/requirements.txt \
    && pip install "uwsgi==2.0.28"

# Non-root runtime user.
RUN groupadd -g 10001 metawahl \
    && useradd  -u 10001 -g 10001 -s /usr/sbin/nologin -M metawahl \
    && mkdir -p /var/log/metawahl \
    && chown -R metawahl:metawahl /var/log/metawahl /app

COPY --chown=metawahl:metawahl api /app/api

USER metawahl

EXPOSE 3001

# Healthcheck hits /v3/base which reads from DB — verifies full stack.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3001/v3/base >/dev/null || exit 1

CMD ["uwsgi", "--ini", "/app/api/uwsgi.docker.ini"]
