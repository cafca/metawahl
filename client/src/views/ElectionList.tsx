import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import useBase from "@/hooks/useBase";
import { Map, type MapTerritory } from "@/components/Map";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import type { ElectionSummary } from "@/types/api";

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

type TerritoryColumnProps = {
  slug: TerritorySlug;
  elections: ElectionSummary[];
};

function TerritoryColumn({ slug, elections }: TerritoryColumnProps) {
  const sorted = useMemo(
    () => [...elections].sort(sortByDateDesc),
    [elections],
  );
  return (
    <div className="mb-12">
      <Map
        territory={mapTerritoryFor(slug)}
        className="float-right ml-4 mb-4 w-1/4 max-h-40"
      />
      <h1 className="mb-4 w-3/4 border-b pb-2 text-2xl font-bold">
        <Link to={`/wahlen/${slug}/`} className="hover:underline">
          {TERRITORY_NAMES[slug]}
        </Link>
      </h1>
      <ul className="divide-y">
        {sorted.map((election) => (
          <li key={election.id}>
            <Link
              to={`/wahlen/${election.territory}/${election.id}/`}
              className="flex flex-col gap-0.5 py-3 hover:bg-accent/40"
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
  );
}

export default function ElectionList() {
  const { data, isLoading } = useBase();

  const { orderedSlugs, electionsByTerritory, electionCount } = useMemo(() => {
    const elections = data?.data.elections;
    if (elections == null) {
      return {
        orderedSlugs: [] as TerritorySlug[],
        electionsByTerritory: {} as Partial<
          Record<TerritorySlug, ElectionSummary[]>
        >,
        electionCount: 0,
      };
    }
    const allSlugs = Object.keys(elections) as TerritorySlug[];
    const ordered: TerritorySlug[] = [];
    if (allSlugs.includes("deutschland")) ordered.push("deutschland");
    if (allSlugs.includes("europa")) ordered.push("europa");
    for (const slug of allSlugs) {
      if (slug !== "deutschland" && slug !== "europa") ordered.push(slug);
    }
    let count = 0;
    for (const slug of ordered) {
      count += elections[slug]?.length ?? 0;
    }
    return {
      orderedSlugs: ordered,
      electionsByTerritory: elections,
      electionCount: count,
    };
  }, [data]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <title>Metawahl: Alle Wahlen im Überblick</title>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="relative flex min-h-[210px] items-end bg-[rgb(42,64,101)] p-5 text-white md:col-span-1">
          <div className="font-sans">
            <div className="text-6xl font-semibold leading-none">
              {electionCount > 0 ? electionCount : 50}
            </div>
            <div className="mt-2 text-2xl uppercase tracking-wide">Wahlen</div>
          </div>
        </div>
        <div className="md:col-span-3">
          <h3 className="mb-3 text-xl font-semibold">
            Bundestags-, Landtags- und Europawahlen in der Übersicht
          </h3>
          <p className="text-base leading-relaxed">
            Diese Übersicht zeigt alle Wahlen, zu denen ein Wahl-o-Mat
            herausgegeben wurde. Das sind leider nicht alle Wahlen, seitdem
            dieses Tool für die Bundestagswahl 2002 das erste Mal produziert
            wurde. Zu Wahlen in Mecklenburg-Vorpommern gab es noch gar keine
            Ausgabe und auch einzelne andere Wahlen, wie die Landtagswahl in
            Niedersachsen 2017, sind hier nicht vertreten.
          </p>
        </div>
      </section>

      {isLoading && (
        <p className="py-8 text-center text-muted-foreground">Lädt…</p>
      )}

      <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
        {orderedSlugs.map((slug) => {
          const elections = electionsByTerritory[slug];
          if (elections == null || elections.length === 0) return null;
          return (
            <TerritoryColumn
              key={slug}
              slug={slug}
              elections={elections}
            />
          );
        })}
      </div>
    </div>
  );
}
