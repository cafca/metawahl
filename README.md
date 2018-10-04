![Metawahl Logo](https://raw.githubusercontent.com/ciex/metawahl/master/metawahl_logo.png)

# Metawahl [![Build Status](https://travis-ci.org/ciex/metawahl.svg?branch=master)](https://travis-ci.org/ciex/metawahl)

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

## Server

Der Server wurde als Flask app (Python) entwickelt und bietet eine JSON
API, die vom Client angesprochen wird um Daten abzurufen und Nutzereingaben 
zu speichern. Dazugehörige Quellen finden sich im Verzeichnis `/api-server`.

    $ virtualenv -p Python3 metawahl
    $ cd metawahl && source bin/activate
    $ git clone https://github.com/ciex/metawahl.git src
    $ cd src/api-server
    $ METAWAHL_CONFIG=dev.conf.py python main.py

Um den Server dauerhaft laufen zu lassen, sollte dieser z.B. als uWSGI Awendung 
über einen Webserver wie Nginx laufen. Hierzu:

1. Server-Einrichtung wie oben
2. Firewall Port für die API öffnen (z.B. 9000)
3. Analog zum Beispiel in `uwsgi.ini.sample` eine uWSGI Konfiguration 
erstellen. Hierbei unbedingt die letzte Zeile ent-kommentieren und ein SECRET eintragen.
4. Systemd Unit File erstellen um uWSGI automatisch zu starten
5. Nginx konfigurieren, so dass Anfragen an die entsprechende Domain an den 
Metawahl-Socket weitergeleitet werden.
6. Memcached installieren (unter Ubuntu: `libmemcached-dev` und `zlib1g-dev` )

Eine ausführliche Anleitung hierzu findet sich zum Beispiel auf:

https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-uwsgi-and-nginx-on-ubuntu-16-04

## Dataset

The dataset needs to be downloaded and imported to a Postgresql database 
available to the server. First, initialize the Git submodule containing the 
dataset.

    $ git submodule init
    $ git submodule update

Make sure that a Postgres server is running and update the server config file 
`api-server/dev.conf.py` to include its connection URI.

    SQLALCHEMY_DATABASE_URI="postgresql://localhost/metawahl"

Now you can import the dataset to the database:

    $ cd api-server
    $ python models.py
    $ METAWAHL_CONFIG=dev.conf.py python bootstrap_db.py

## Client

Die Benutzeroberfläche ist als React-Webapp umgesetzt. Nach Installation des
Servers:

    $ cd metawahl/src/client/
    $ npm install
    $ npm start

## Daten bearbeiten

Nur der Seitenbetreiber sollte Tags, Kategorien, etc. bearbeiten können um 
Missbrauch auszuschließen. Um sich als Admin einzuloggen muss in der Browser-Konsole
der Local Storage Schlüssel `admin_key` auf den gleichen Wert gesetzt sein, wie
die Umgebungsvariable `METAWAHL_ADMIN_KEY` auf dem Server. 

Die Umgebungsvariable kann zum Beispiel über die Konfigurationsdatei `uwsgi.ini`
gesetzt werden. Ist sie nicht gesetzt, wird beim Start des Server eine 
Warnung ausgegeben. 

## Updates

Das Skript `deploy.sample.sh` kann angepasst werden, um eine bestehende 
Installation von metawahl durch Ausfürung eines einzelnen Skripts zu 
aktualisieren. Hierbei bleiben alle Daten bestehen, nur die Quellen für
Client und Server werden auf den neusten Stand des Git-Repositorys gebracht.

# Changelog

Version | Beschreibung
--------|--------------
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
