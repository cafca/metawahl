import deutschlandUrl from "@/assets/maps/Deutschland.svg";
import europaUrl from "@/assets/maps/Europa.svg";
import { cn } from "@/lib/utils";

export type MapTerritory = "deutschland" | "europa";

type MapProps = {
  territory: MapTerritory;
  className?: string;
};

const NOTE_EUROPE =
  "SVG Europakarte lizensiert unter Public Domain, via Wikimedia Commons (Link siehe Impressum)";

const NOTE_GERMANY =
  "SVG Deutschlandkarte lizensiert unter Creative Commons Attribution-Share Alike 2.0 Germany und basierend auf Roman Poulvas, David Liuzzo (Karte Bundesrepublik Deutschland.svg), via Wikimedia Commons (Siehe Link im Impressum).";

const ALT: Record<MapTerritory, string> = {
  europa: "Europakarte",
  deutschland: "Karte Bundesrepublik Deutschland",
};

export function Map({ territory, className }: MapProps) {
  const isEuropa = territory === "europa";
  return (
    <img
      src={isEuropa ? europaUrl : deutschlandUrl}
      alt={ALT[territory]}
      title={isEuropa ? NOTE_EUROPE : NOTE_GERMANY}
      className={cn("map max-h-48", className)}
    />
  );
}

export default Map;
