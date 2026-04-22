FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv

# Build deps: psycopg2 needs libpq; lxml needs libxml2/xslt.
# Keep build tools only during wheel build, then strip to shrink the layer.
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      libxml2-dev \
      libxslt1-dev \
      curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.5.14 /uv /usr/local/bin/uv

WORKDIR /app

# Install project deps (cached layer) via uv sync against pyproject + lock.
COPY api/pyproject.toml api/uv.lock /app/api/
RUN cd /app/api && uv sync --frozen --no-install-project --no-dev \
    && uv pip install --python ${UV_PROJECT_ENVIRONMENT} "uwsgi==2.0.28"

ENV PATH="/opt/venv/bin:${PATH}"

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
