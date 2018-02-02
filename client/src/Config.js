// @flow

// Settings

export const DATA_DIR = "/data";

export const API_ROOT = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? "http://localhost:9000/api/v1"
  : "https://api.metawahl.de/api/v1";

// Tools

export const adminKey = () => {
  try {
    return localStorage.getItem("admin_key");
  } catch(e) {}

  return null;
}

export const IS_ADMIN = adminKey() != null;

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

// Language

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
  "offentliche-finanzen-steuern-und-abgaben": "Öffentliche Finanzen, Steuern und Abgaben",
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
  "wissenschaft-forschung-und-technologie": "Wissenschaft, Forschung und Technologie"
};

export const categoryOptions = Object.keys(CATEGORY_NAMES).map(
  slug => ({key: slug, value: slug, text: CATEGORY_NAMES[slug]}));

// Cosmetic

export const PAGE_TITLE = "Metawahl ";

export const setTitle = (title?:string) => {
  if (title != null) {
    document.title = PAGE_TITLE + title;
  } else {
    document.title = PAGE_TITLE;
  }
}

export const THESES_PER_PAGE = 5;

// http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker#dcbc37,a56072,82e8b3,796da0
// http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker#f1376c,2d339f
const COLOR_PALETTE = ["#f1376c", "#eb376e", "#e63770", "#e03773", "#db3775", "#d53777", "#cf3779", "#ca377b", "#c4377d", "#be377f", "#b83781", "#b23783", "#ac3785", "#a63687", "#a03689", "#99368b", "#93368d", "#8c368f", "#853691", "#7e3693", "#773595", "#6f3597", "#673599", "#5e359b", "#55359d", "#4a349f", "#3e34a1", "#2e34a3"];

// Assign a color to each category
export const CATEGORY_COLORS = Object.keys(CATEGORY_NAMES)
  .reduce((prev, cur, i) => {
    prev[cur] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    return prev;
  }, {});
