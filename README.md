# Metawahl

![Screenshot von Metawahl](https://raw.githubusercontent.com/ciex/metawahl/master/screenshot.png)


Metawahl schafft einen interaktiven Zugang zum Wandel der politischen Landschaft 
in Deutschland über eine Aufbereitung der vielen hundert Thesen, die im Rahmen 
des Wahl-o-Maten von den Parteien bewertet wurden. Hieraus lässt sich nicht nur
ablesen, wie sich die Stellung der Parteien zu bestimmten Themen über die Zeit
geändert hat, sondern auch die wandernden Grenzen dessen, was überhaupt zur Debatte
steht, werden sichtbar.

Dieses Repository enthält den Quellcode für Server und Client der dazugehörigen
Website https://metawahl.de. 

# Installation

## Server

Der Server wurde mithilfe von Flask (Python) entwickelt und bietet eine JSON
API, die vom Client angesprochen wird um Daten abzurufen und Nutzereingaben zu
speichern. Dazugehörige Quellen finden sich im Verzeichnis `/api-server`.

    $ virtualenv -p Python3 metawahl
    $ cd metawahl && source bin/activate
    $ git clone https://github.com/ciex/metawahl.git src
    $ cd src/api-server
    $ METAWAHL_CONFIG=dev.conf.py python main.py

## Dataset

The dataset needs to be downloaded and imported to a Postgresql database available to the server. First, initialize the Git submodule containing the dataset.

    $ git submodule init
    $ git submodule update

Make sure that a Postgres server is running and update the server config file `api-server/dev.conf.py` to include its connection URI.

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


# Lizenz

Siehe die Datei `./LICENSE`.

Gefördert vom Bundesministerium für Bildung und Forschung

![](https://raw.githubusercontent.com/ciex/mietlimbo/master/client/src/Graphics/logo-bmbf.svg?sanitize=true)
![](https://raw.githubusercontent.com/ciex/mietlimbo/master/client/src/Graphics/logo-okfn.svg?sanitize=true)
