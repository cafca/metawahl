import os

DEBUG = True
SECRET_KEY="server development secret key"
SQLALCHEMY_DATABASE_URI="postgresql://localhost/metawahl"
SQLALCHEMY_TRACK_MODIFICATIONS = True
SQLALCHEMY_ECHO = False
SQLALCHEMY_RECORD_QUERIES = False


CATEGORY_NAMES = [
    "Arbeit und Beschäftigung",
    "Ausländerpolitik, Zuwanderung",
    "Außenpolitik und internationale Beziehungen",
    "Außenwirtschaft",
    "Bildung und Erziehung",
    "Bundestag",
    "Energie",
    "Entwicklungspolitik",
    "Europapolitik und Europäische Union",
    "Gesellschaftspolitik, soziale Gruppen",
    "Gesundheit",
    "Innere Sicherheit",
    "Kultur",
    "Landwirtschaft und Ernährung",
    "Medien, Kommunikation und Informationstechnik",
    "Neue Bundesländer",
    "Öffentliche Finanzen, Steuern und Abgaben",
    "Politisches Leben, Parteien",
    "Raumordnung, Bau- und Wohnungswesen",
    "Recht",
    "Soziale Sicherung",
    "Sport, Freizeit und Tourismus",
    "Staat und Verwaltung",
    "Umwelt",
    "Verkehr",
    "Verteidigung",
    "Wirtschaft",
    "Wissenschaft, Forschung und Technologie"
]
