# Metawahl [![Build Status](https://travis-ci.org/ciex/metawahl.svg?branch=master)](https://travis-ci.org/ciex/metawahl)

Metawahl schafft einen interaktiven Zugang zum Wandel der politischen Landschaft 
in Deutschland über eine Aufbereitung der vielen hundert Thesen, die im Rahmen 
des Wahl-o-Maten von den Parteien bewertet wurden. Hieraus lässt sich nicht nur
ablesen, wie sich die Stellung der Parteien zu bestimmten Themen über die Zeit
geändert hat, sondern auch die wandernden Grenzen dessen, was überhaupt zur Debatte
steht, werden sichtbar.

![Screenshot von Metawahl](https://raw.githubusercontent.com/ciex/metawahl/master/screenshot.png)

Dieses Repository enthält den Quellcode für Server und Client der dazugehörigen
Website https://metawahl.de. 

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

# Lizenz

Siehe die Datei `./LICENSE`.

Gefördert vom Bundesministerium für Bildung und Forschung

![](https://raw.githubusercontent.com/ciex/mietlimbo/master/client/src/Graphics/logo-bmbf.svg?sanitize=true)
![](https://raw.githubusercontent.com/ciex/mietlimbo/master/client/src/Graphics/logo-okfn.svg?sanitize=true)
