// @flow

export const DATA_DIR = "/data";
export const API_ROOT = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? "http://localhost:9000/api/v1"
  : "http://metawahl.de:9000/api/v1";

export const PAGE_TITLE = "Metawahl ";

export const setTitle = (title?:string) => {
  if (title != null) {
    document.title = PAGE_TITLE + title;
  } else {
    document.title = PAGE_TITLE;
  }
}

export const makeJSONRequest = (data: {}) => {
  return {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
}

export const TERRITORY_NAMES = {
  "badenwuerttemberg": "Baden-Württemberg",
  "bayern": "Bayern",
  "berlin": "Berlin",
  "brandenburg": "Brandenburg",
  "bremen": "Bremen",
  "deutschland": "Deutschland",
  "europa": "Europa",
  "hamburg": "Hamburg",
  "niedersachsen": "Niedersachsen",
  "nordrheinwestfalen": "Nordrhein-Westfalen",
  "rheinlandpfalz": "Rheinland-Pfalz",
  "saarland": "Saarland",
  "sachsen": "Sachsen",
  "sachsenanhalt": "Sachsen-Anhalt",
  "schleswigholstein": "Schleswig-Holstein",
  "thueringen": "Thüringen"
};

export const CATEGORY_NAMES = {
  "arbeit-und-beschaftigung": "Arbeit und Beschäftigung",
  "auslanderpolitik-zuwanderung": "Ausländerpolitik, Zuwanderung",
  "aussenpolitik-und-internationale-beziehungen": "Außenpolitik und internationale Beziehungen",
  "aussenwirtschaft": "Außenwirtschaft",
  "bildung-und-erziehung": "Bildung und Erziehung",
  "bundestag": "Bundestag",
  "energie": "Energie",
  "entwicklungspolitik": "Entwicklungspolitik",
  "europapolitik-und-europaische-union": "Europapolitik und Europäische Union",
  "gesellschaftspolitik-soziale-gruppen": "Gesellschaftspolitik, soziale Gruppen",
  "gesundheit": "Gesundheit",
  "innere-sicherheit": "Innere Sicherheit",
  "kultur": "Kultur",
  "landwirtschaft-und-ernahrung": "Landwirtschaft und Ernährung",
  "medien-kommunikation-und-informationstechnik": "Medien, Kommunikation und Informationstechnik",
  "neue-bundeslander": "Neue Bundesländer",
  "politisches-leben-parteien": "Politisches Leben, Parteien",
  "raumordnung-bau-und-wohnungswesen": "Raumordnung, Bau- und Wohnungswesen",
  "recht": "Recht",
  "soziale-sicherung": "Soziale Sicherung",
  "sport-freizeit-und-tourismus": "Sport, Freizeit und Tourismus",
  "staat-und-verwaltung": "Staat und Verwaltung",
  "umwelt": "Umwelt",
  "verkehr": "Verkehr",
  "verteidigung": "Verteidigung",
  "wirtschaft": "Wirtschaft",
  "wissenschaft-forschung-und-technologie": "Wissenschaft, Forschung und Technologie",
  "offentliche-finanzen-steuern-und-abgaben": "Öffentliche Finanzen, Steuern und Abgaben"
};

// All colors without teal, brown, pink
const colorNames = ["red", "orange", "yellow", "olive", "green",
  "blue", "violet", "purple", "grey", "black"];

// Assign a color to each category
export const CATEGORY_COLORS = Object.keys(CATEGORY_NAMES)
  .reduce((prev, cur, i) => {
    prev[cur] = colorNames[i % colorNames.length];
    return prev;
  }, {});

export const categoryOptions = Object.keys(CATEGORY_NAMES).map(
  slug => ({key: slug, value: slug, text: CATEGORY_NAMES[slug]}));
