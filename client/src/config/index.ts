// Settings and constants ported from the legacy CRA config (src.legacy/config/index.js).
// Runtime values are read from Vite's `import.meta.env` instead of `process.env`.

export const DATA_DIR = "/data";

export const API_VERSION = "Metawahl API v3";

export const API_ROOT: string =
  import.meta.env.VITE_API_ROOT ??
  (import.meta.env.DEV ? "http://localhost:3001/v3" : "https://api.metawahl.de/v3");

export const SITE_ROOT: string = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://metawahl.de";

// Language

export type TerritorySlug =
  | "badenwuerttemberg"
  | "bayern"
  | "berlin"
  | "brandenburg"
  | "bremen"
  | "deutschland"
  | "europa"
  | "hamburg"
  | "hessen"
  | "niedersachsen"
  | "nordrheinwestfalen"
  | "rheinlandpfalz"
  | "saarland"
  | "sachsen"
  | "sachsenanhalt"
  | "schleswigholstein"
  | "thueringen";

export const TERRITORY_NAMES: Record<TerritorySlug, string> = {
  badenwuerttemberg: "Baden-Württemberg",
  bayern: "Bayern",
  berlin: "Berlin",
  brandenburg: "Brandenburg",
  bremen: "Bremen",
  deutschland: "Deutschland",
  europa: "Europa",
  hamburg: "Hamburg",
  hessen: "Hessen",
  niedersachsen: "Niedersachsen",
  nordrheinwestfalen: "Nordrhein-Westfalen",
  rheinlandpfalz: "Rheinland-Pfalz",
  saarland: "Saarland",
  sachsen: "Sachsen",
  sachsenanhalt: "Sachsen-Anhalt",
  schleswigholstein: "Schleswig-Holstein",
  thueringen: "Thüringen",
};

export const OBJECTION_NAMES: Record<"-1" | "0" | "1", [string, string, string]> = {
  "-1": ["Trotzdem umgesetzt", "Neutral", "Nicht umgesetzt"],
  "0": ["Nicht umgesetzt", "Neutral", "Umgesetzt"],
  "1": ["Nicht umgesetzt", "Neutral", "Umgesetzt"],
};

// Cosmetic

export const THESES_PER_PAGE = 20;

export const COLOR_PALETTE: readonly string[] = [
  "rgb(213, 0, 28)",
  "rgb(160,160,160)",
  "rgb(42, 64, 101)",
] as const;

export const OPINION_COLORS: Record<"-1" | "0" | "1" | "missing", string> = {
  "-1": COLOR_PALETTE[0]!,
  "0": COLOR_PALETTE[Math.floor(COLOR_PALETTE.length / 2)]!,
  "1": COLOR_PALETTE[COLOR_PALETTE.length - 1]!,
  missing: "rgb(80, 80, 80)",
};
