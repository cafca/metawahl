import Deutschland from "@/assets/maps/Deutschland.svg?react";
import Europa from "@/assets/maps/Europa.svg?react";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";

import "./Map.css";

type MapProps = {
  territory: TerritorySlug;
  style?: React.CSSProperties;
  inverted?: boolean;
};

function altText(territory: TerritorySlug): string {
  if (territory === "europa") return "Europakarte";
  if (territory === "deutschland") return "Karte Bundesrepublik Deutschland";
  return (
    "Karte Bundesrepublik Deutschland mit Hervorherbung von " +
    TERRITORY_NAMES[territory]
  );
}

export function Map({ territory, style, inverted }: MapProps) {
  if (territory === "europa") {
    return <Europa aria-label={altText(territory)} style={style} className="map" />;
  }
  const className =
    (inverted ? "inverted " : " ") + "map territory-" + territory;
  return (
    <Deutschland
      className={className}
      aria-label={altText(territory)}
      style={style}
    />
  );
}

export default Map;
