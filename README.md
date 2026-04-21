![Metawahl Logo](https://raw.githubusercontent.com/ciex/metawahl/master/metawahl_logo.png)

# Metawahl [![CI](https://github.com/ciex/metawahl/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/ciex/metawahl/actions/workflows/ci.yml)

Metawahl verbindet Wahlergebnisse aus den letzten 16 Jahren mit über 21.000 Parteipositionen aus dem Wahl-o-Maten. Dabei wird sichtbar: Hat eine Mehrheit für eine Idee gestimmt – oder dagegen?

Dieses Repository enthält den Quellcode für Server und Client der dazugehörigen
Website.

## Wie Metawahl funktioniert

### Parteien wollen unterschiedliche Politik machen

Bei Wahlen geben wir Parteien unsere Stimme, damit diese in unserem Namen Entscheidungen treffen. Jede Partei vertritt dabei unterschiedliche Positionen zu ausstehenden Entscheidungen.

Aber in welchen Punkten unterscheiden sich die Parteien eigentlich genau voneinander? Der Wahl-o-Mat der Bundeszentrale für politische Bildung ist enorm erfolgreich darin, uns zu zeigen, welche Fragen wir ihnen stellen können um sie klar voneinander zu trennen.

### Aber welche Politik hat die Wahl gewonnen?

Nach der Wahl wissen wir, welche Parteien die meisten Stimmen bekommen haben. Wenn Parteien und Positionen sich einfach in links und rechts teilen ließen, wäre damit auch klar, welche Positionen gewonnen haben.

Aber was ist, wenn Parteien sich in vielen verschiedenen Richtungen gegenüberstehen? Wenn eine klassisch konservative Partei auch linke Postionen vertritt, oder eine klassisch linke Partei auch für konservative Interessen einsteht? Welche Politik hat jetzt die Mehrheit der Wählerstimmen bekommen? Genau das zeigt Metawahl für viele Wahlen in Deutschland, durch eine Verbindung der Fragen und Antworten aus dem Wahl-o-Mat mit den jeweiligen Wahlergebnissen.

### Oft unter einem Kompromiss

Die Position mit einer Mehrheit ist dabei nicht immer die, die von den meisten Wählern gewünscht wird. Bei Abstimmungen unserem repräsentativen Wahlsystem werden auch ungewünschte Positionen mit eingekauft, weil es nur eine begrenzte Anzahl an Parteien auf dem Wahlzettel gibt.

Auf Metawahl findest du heraus, welche Positionen unter diesem Kompromiss eine Mehrheit der Wählerstimmen bekommen haben.

In den Thesen spiegelt sich auch, wie sich die Position der Wähler oder einer Partei über die Zeit entwickelt hat und wie sie unterschiedlich sie bei Wahlen in Europa, den Bundestags- und verschiedenen Landtagswahlen sein kann.

# Installation

Die Anwendung läuft als Docker-Compose-Stack aus vier Services: `api` (Flask
3 / Python 3.12 / uWSGI), `client` (React), `db` (Postgres 16) und `redis`
(Flask-Caching). Quellen für Server und Client liegen in `/api` bzw. `/client`.

## Voraussetzungen

Docker Engine mit Compose-V2-Plugin. Git submodules müssen zusätzlich
initialisiert werden, damit `bootstrap_db.py` die Wahl-o-Mat- und
Wahlergebnis-Quellen findet:

    $ git clone https://github.com/ciex/metawahl.git
    $ cd metawahl
    $ git submodule update --init --recursive

## Konfiguration

Secrets und weitere Konfiguration werden über eine `.env`-Datei neben der
`compose.yml` gesetzt. Als Ausgangspunkt dient `.env.example`:

    $ cp .env.example .env
    $ # METAWAHL_SECRET, METAWAHL_ADMIN_KEY und POSTGRES_PASSWORD anpassen

Die API liest ihre Flask-Konfiguration aus der Datei, auf die
`METAWAHL_CONFIG` zeigt (per Default `api/app/prod.conf.py` im Container).

## Start (Development)

Im Repo-Root:

    $ docker compose build
    $ docker compose up -d db redis
    $ docker compose run --rm -w /app/api api uv run alembic upgrade head
    $ docker compose run --rm -w /app/api api python scripts/bootstrap_db.py
    $ docker compose up -d api client

`compose.override.yml` wird im Dev-Modus automatisch gemerged und startet
die API mit `flask run --reload` auf `http://localhost:3001`, der Client
läuft unter `http://localhost:3000`. Für psql-Zugriff:

    $ docker compose exec db psql -U metawahl metawahl

## Start (Production)

In production nur die Basis-Compose-Datei verwenden, damit die Dev-Overrides
nicht greifen:

    $ docker compose -f compose.yml up -d

Die API läuft dann unter uWSGI hinter Port 3001, der Client liefert den
statischen Build über Nginx aus. Beide Images werden von der CI zusätzlich
nach `ghcr.io/ciex/metawahl-api` und `ghcr.io/ciex/metawahl-client` gepusht.

## Lokale Entwicklung ohne Container (uv)

Python-Toolchain direkt via [`uv`](https://docs.astral.sh/uv/):

    $ cd api
    $ uv sync
    $ docker compose up -d db redis    # Datenbank + Cache weiter im Container
    $ METAWAHL_CONFIG=dev.conf.py \
      METAWAHL_DB_URL=postgresql://metawahl:…@localhost:5432/metawahl \
      uv run flask --app wsgi run --port 9000

### Tests

Tests laufen in-process gegen ein frisches Postgres. Port muss dafür vom
`db`-Service exponiert sein:

    $ cd api
    $ METAWAHL_DB_URL=postgresql://metawahl:…@localhost:5432/metawahl \
      METAWAHL_CONFIG=test.conf.py \
      uv run pytest

### Linting und Typechecking

    $ uv run ruff check
    $ uv run mypy app

## Migrations (Alembic)

Das Schema wird per Alembic verwaltet. Baseline in
`api/migrations/versions/0001_baseline.py`.

**Frische DB:**

    $ uv run alembic upgrade head

**Bestehende DB** aus der Pre-Alembic-Zeit: einmalig stempeln, bevor neue
Migrationen angewendet werden.

    $ uv run alembic stamp 0001_baseline

## Daten bearbeiten

Nur Admins können Tags, Kategorien, etc. bearbeiten. Um sich als Admin einzuloggen muss in der Browser-Konsole
der Local Storage Key `admin_key` auf den gleichen Wert gesetzt sein, wie
die Umgebungsvariable `METAWAHL_ADMIN_KEY` auf dem Server.

Die Variable wird über die `.env`-Datei gesetzt und dem `api`-Container
durch Compose zur Laufzeit übergeben. Ist sie nicht gesetzt, wird beim
Start der API eine Warnung ausgegeben.

## Backups

Nutzergenerierte Daten (Quiz-Antworten) werden über
`api/scripts/backup_userdata.py` nach `userdata/quiz_answers.json`
exportiert so dass nur mit dem Repo eine komplette Umgebung wiederhergestellt werden kann. Im laufenden Stack:

    $ docker compose exec -w /app/api api python scripts/backup_userdata.py

# Changelog

Version | Beschreibung
--------|--------------
2.0.0.  | Komplett modernisierter Backend- und Frontend-Stack
1.9.0   | iFrame für Einbindung in Blogs, etc hinzugefügt. Viele Design-Verbesserungen.
1.8.0   | Neues Design für Wahl-Übersicht, Quiz neu gestaltet
1.7.0   | Backend Refactor und API-Dokumentation auf metawahl.de/daten/
1.6.0   | Thematisch ähnliche Thesen auf jeder Thesenseite
1.5.0   | Neues Format für die Startseite
1.4.0   | Unterstützung von vorläufigen Wahlergebnissen
1.3.0   | Kompakte Thesendarstellung
1.2.0   | Bessere Quiz-Implementation
1.1.0   | Quiz

# Lizenz

Copyright 2018 Vincent Ahrend

Lizensiert unter der GNU AFFERO GENERAL PUBLIC LICENSE 3.0 (Text der Lizenz 
in der Datei `./LICENSE`.)

Gefördert vom Bundesministerium für Bildung und Forschung

![](https://raw.githubusercontent.com/ciex/mietlimbo/master/client/src/Graphics/logo-bmbf.svg?sanitize=true)
![](https://raw.githubusercontent.com/ciex/mietlimbo/master/client/src/Graphics/logo-okfn.svg?sanitize=true)
