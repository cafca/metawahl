"""Alembic environment.

Loads the Flask app factory to obtain SQLAlchemy metadata. The database URL is
taken from `METAWAHL_DB_URL` if set, else falls back to `sqlalchemy.url` in
alembic.ini — useful for local offline SQL dumps.
"""
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# Make `app/` importable so we can pull SQLAlchemy metadata.
API_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_ROOT / "app"))

os.environ.setdefault(
    "METAWAHL_CONFIG", str(API_ROOT / "app" / "test.conf.py")
)

import models  # noqa: F401, E402 — populate db.metadata
from main import create_app  # noqa: E402
from services import db  # noqa: E402

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

db_url = os.environ.get("METAWAHL_DB_URL") or config.get_main_option("sqlalchemy.url")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

app = create_app()
with app.app_context():
    target_metadata = db.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
