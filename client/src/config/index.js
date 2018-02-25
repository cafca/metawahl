// @flow

// Settings

export const DATA_DIR = "/data";

export const API_ROOT = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? "http://localhost:9000/api/v1"
  : "https://api.metawahl.de/api/v1";

export const SITE_ROOT = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? "http://localhost:3000"
  : "https://metawahl.de"

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

export const OBJECTION_NAMES = {
  "-1": ["Trotzdem umgesetzt", "Neutral", "Nicht umgesetzt"],
  "0": ["Nicht umgesetzt", "Neutral", "Umgesetzt"],
  "1": ["Nicht umgesetzt", "Neutral", "Umgesetzt"]
};

export const REACTION_NAMES = {
  0: "Glücklich",
  1: "Erleichert",
  2: "Gleichgültig",
  3: "Enttäuscht",
  4: "Wütend"
};

// Cosmetic

export const THESES_PER_PAGE = 20;

// http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker#dcbc37,a56072,82e8b3,796da0
// http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker#f1376c,2d339f
// export const COLOR_PALETTE = ["#f1376c", "#eb376e", "#e63770", "#e03773", "#db3775", "#d53777", "#cf3779", "#ca377b", "#c4377d", "#be377f", "#b83781", "#b23783", "#ac3785", "#a63687", "#a03689", "#99368b", "#93368d", "#8c368f", "#853691", "#7e3693", "#773595", "#6f3597", "#673599", "#5e359b", "#55359d", "#4a349f", "#3e34a1", "#2e34a3"];

// Coole dev-toene
// export const COLOR_PALETTE = ["#fc1387", "#fa149e", "#f914b5", "#f715cb", "#f616e1", "#f217f4", "#da18f2", "#c318f1", "#ac19ef", "#951aed", "#7f1bec", "#6a1cea", "#551de8", "#411de7", "#2d1ee5", "#1f25e3", "#2039e1", "#214de0", "#2261de", "#2374dc", "#2486d9", "#2698d7", "#28a8d5", "#29b8d2", "#2bc7d0", "#2ccec6", "#2ecbb3", "#2fc9a2"];

// Drei Töne mit blau in der Mitte (LCH)
// http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker#fc4374,203bd1,16cb96
// export const COLOR_PALETTE = ["#fc4374", "#f8387b", "#f22e82", "#eb2489", "#e31a91", "#da1398", "#d010a0", "#c412a8", "#b618af", "#a61fb7", "#9426be", "#7f2dc4", "#6533ca", "#4039cf", "#0046d9", "#0059e7", "#0068ef", "#0075f3", "#0081f2", "#008cee", "#0096e7", "#009fdc", "#00a7d1", "#00afc4", "#00b7b7", "#00beab", "#00c5a0", "#16cb96"]
// export const COLOR_PALETTE = ["#ffa6a6", "#ecb4b3", "#d7c2c0", "#bececd", "#9fd9db", "#74e4e8", "#00eff6"];
// export const COLOR_PALETTE = ["#ffa8b1", "#e9aebc", "#d2b4c7", "#b7b8d3", "#97bdde", "#6dc1ea", "#00c4f5"];
// export const COLOR_PALETTE = [ "#ffa8b1",  "#deb1c2",  "rgb(184, 184, 184)",  "#84bfe4",  "#00c4f5"];

// Frankreich lol
// http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker#ff7f7f,5c8aad
// export const COLOR_PALETTE = ["#ff7f7f", "#de858b", "rgb(180, 180, 180)", "#928aa2", "#5e8bae"];
export const COLOR_PALETTE = [
  "rgb(213, 0, 28)",
  "rgb(180,180,180)",
  "rgb(42, 64, 101)"
];

// export const COLOR_PALETTE = ["#ffac82", "#ebc170", "rgb(148, 148, 148)", "#8ce999", "#00f7d2"]


// Assign a color to each category
export const CATEGORY_COLORS = Object.keys(CATEGORY_NAMES)
  .reduce((prev, cur, i) => {
    prev[cur] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    return prev;
  }, {});

export const OPINION_COLORS = {
  "-1": COLOR_PALETTE[0],
  "0": COLOR_PALETTE[parseInt(COLOR_PALETTE.length / 2.0, 10)],
  "1": COLOR_PALETTE[COLOR_PALETTE.length - 1],
  "missing": "rgb(80, 80, 80)"
}
