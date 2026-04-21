import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import useBase from "@/hooks/useBase";
import { Map, type MapTerritory } from "@/components/Map";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import type { ElectionSummary } from "@/types/api";

function isTerritorySlug(value: string | undefined): value is TerritorySlug {
  return value != null && value in TERRITORY_NAMES;
}

function sortByDateDesc(a: ElectionSummary, b: ElectionSummary): number {
  return a.date < b.date ? 1 : -1;
}

function firstWord(title: string): string {
  const space = title.indexOf(" ");
  return space === -1 ? title : title.slice(0, space);
}

function mapTerritoryFor(slug: TerritorySlug): MapTerritory {
  return slug === "europa" ? "europa" : "deutschland";
}

export default function Territory() {
  const { territory } = useParams<{ territory: string }>();
  const { data, isLoading } = useBase();

  const slug = isTerritorySlug(territory) ? territory : null;

  const elections = useMemo(() => {
    if (slug == null) return [];
    const list = data?.data.elections[slug];
    if (list == null) return [];
    return [...list].sort(sortByDateDesc);
  }, [data, slug]);

  if (slug == null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <title>Metawahl: Gebiet nicht gefunden</title>
        <h1 className="mb-4 text-2xl font-bold">Gebiet nicht gefunden</h1>
        <p className="mb-6 text-muted-foreground">
          Das gesuchte Gebiet „{territory}“ ist uns nicht bekannt.
        </p>
        <Link to="/wahlen/" className="underline">
          Zurück zur Übersicht aller Wahlen
        </Link>
      </div>
    );
  }

  const territoryName = TERRITORY_NAMES[slug];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <title>{`Metawahl: Alle Wahlthemen in ${territoryName}`}</title>

      <nav
        aria-label="Brotkrumen"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Link to="/wahlen/" className="hover:underline">
          Wahlen
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link to={`/wahlen/${slug}/`} className="hover:underline">
          {territoryName}
        </Link>
      </nav>

      <h1 className="mb-6 border-b pb-2 text-3xl font-bold">
        <Link to={`/wahlen/${slug}/`} className="hover:underline">
          Wahlen in {territoryName}
        </Link>
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <Map
            territory={mapTerritoryFor(slug)}
            className="max-h-40 w-full"
          />
        </div>

        <div className="md:col-span-8">
          {isLoading && (
            <p className="py-4 text-center text-muted-foreground">Lädt…</p>
          )}
          {!isLoading && elections.length === 0 && (
            <p className="py-4 text-muted-foreground">
              Keine Wahlen für dieses Gebiet vorhanden.
            </p>
          )}
          <ul className="divide-y">
            {elections.map((election) => (
              <li key={election.id}>
                <Link
                  to={`/wahlen/${election.territory}/${election.id}/`}
                  className="flex flex-col gap-0.5 py-4 hover:bg-accent/40"
                >
                  <span className="text-lg font-semibold">
                    {new Date(election.date).getFullYear()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {firstWord(election.title)} vom{" "}
                    {format(new Date(election.date), "PPP", { locale: de })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
