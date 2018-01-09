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
