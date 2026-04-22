import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ChevronRight, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import { Legend } from "@/components/Legend";
import { SuggestionsGrid, type SuggestionSection } from "@/components/SuggestionsGrid";
import { Thesis as ThesisCard } from "@/components/Thesis";
import { WikidataLabel } from "@/components/DataLabel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import useBase from "@/hooks/useBase";
import useElection from "@/hooks/useElection";
import type { Election, Thesis } from "@/types/api";
import { copyToClipboard, toAbsoluteUrl } from "@/lib/clipboard";

function isKnownTerritory(slug: string | undefined): slug is TerritorySlug {
  return slug != null && slug in TERRITORY_NAMES;
}

/**
 * Compute the ratio of positive vote share by summing the
 * election-result percentage of each party with a pro/con position.
 */
function getRatio(
  thesis: Thesis,
  election: Election,
  reverse = false,
): number {
  const results = election.results;
  return thesis.positions
    .filter((p) => (reverse ? p.value === -1 : p.value === 1))
    .reduce((acc, pos) => {
      const row = results[pos.party];
      if (row == null) {
        // Look for linked-position rows
        let sum = 0;
        for (const key of Object.keys(results)) {
          if (results[key]?.linked_position === pos.party) {
            sum += results[key]?.pct ?? 0;
          }
        }
        return acc + sum;
      }
      return acc + (row.pct ?? 0);
    }, 0);
}

export default function ElectionView() {
  const params = useParams<{ territory: string; electionNum: string }>();
  const electionNum = Number.parseInt(params.electionNum ?? "", 10);
  const territory = params.territory;
  const paramsValid =
    Number.isFinite(electionNum) && isKnownTerritory(territory);

  const baseQuery = useBase();
  const base = baseQuery.data?.data;

  const cachedElection = useMemo<Election | undefined>(() => {
    if (!paramsValid || base == null) return undefined;
    return base.elections[territory]?.find((e) => e.id === electionNum);
  }, [base, territory, electionNum, paramsValid]);

  const electionQuery = useElection(paramsValid ? electionNum : Number.NaN);
  const election: Election | undefined =
    electionQuery.data?.data ?? cachedElection;

  // Pick a sibling election for the suggestions strip.
  const sibling = useMemo<Election | undefined>(() => {
    if (!paramsValid || base == null) return undefined;
    const bucket = base.elections[territory];
    if (bucket == null) return undefined;
    const reversed = [...bucket].reverse();
    return reversed.find((e) => e.id !== electionNum);
  }, [base, territory, electionNum, paramsValid]);

  const suggestions: SuggestionSection[] = useMemo(() => {
    if (election == null) return [];
    const other = sibling ?? election;
    return [
      {
        subTitle: "Teste dein Wissen",
        title: "Quiz zur " + election.title,
        href: `/quiz/${territory}/${electionNum}/`,
      },
      {
        subTitle: "Welche Politik wurde gewählt",
        title: other.title,
        href: `/wahlen/${territory}/${other.id}/`,
      },
      {
        subTitle: "Alle Wahlen in",
        title: isKnownTerritory(territory)
          ? TERRITORY_NAMES[territory]
          : territory ?? "",
        href: `/wahlen/${territory}/`,
      },
      {
        subTitle: "Stöbere in",
        title: "600+ Wahlkampfthemen",
        href: "/themen/",
      },
    ];
  }, [election, sibling, territory, electionNum]);

  // Sort theses by how strongly "pro" they ended up (most agreement first).
  const sortedTheses = useMemo(() => {
    const list = electionQuery.data?.theses ?? [];
    if (election == null) return list;
    return [...list].sort((a, b) =>
      getRatio(a, election) > getRatio(b, election) ? -1 : 1,
    );
  }, [electionQuery.data, election]);

  if (!paramsValid) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <title>Metawahl</title>
        <Alert variant="destructive">
          <AlertTitle>Ungültige Adresse</AlertTitle>
          <AlertDescription>
            Diese Wahl konnte nicht geladen werden.{" "}
            <Link to="/wahlen/" className="underline">
              Zur Wahlenübersicht
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const territoryName = TERRITORY_NAMES[territory];
  const isLoading = electionQuery.isLoading || baseQuery.isLoading;
  const error = electionQuery.error ?? baseQuery.error ?? null;

  const year = election != null ? new Date(election.date).getFullYear() : null;
  const legendShowMissing = year != null && year < 2008;

  const pageTitle =
    election != null ? `Metawahl: ${election.title}` : "Metawahl";

  const title =
    election == null
      ? ""
      : `Welche Politik wurde bei der ${
          election.title === "Landtagswahl Hessen 2018"
            ? "Hessenwahl"
            : election.title
        } gewählt?`;

  const sourceName = election?.results_source?.name ?? "";
  const quizUrl = `/quiz/${territory}/${electionNum}/`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <title>{pageTitle}</title>

      <nav
        aria-label="Brotkrumen"
        className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link to="/wahlen/" className="hover:underline">
          Wahlen
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link to={`/wahlen/${territory}/`} className="hover:underline">
          {territoryName}
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        {election == null ? (
          <span>Lädt…</span>
        ) : (
          <span aria-current="page" className="font-medium text-foreground">
            {year}
          </span>
        )}
      </nav>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          {election != null && (
            <>
              <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
              <p className="mt-2 text-muted-foreground">
                {format(new Date(election.date), "PPP", { locale: de })} ·{" "}
                {territoryName}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {election != null && (
            <WikidataLabel
              wikidata_id={election.wikidata_id}
              url={
                election.wikidata_id != null
                  ? `https://www.wikidata.org/wiki/${election.wikidata_id}`
                  : undefined
              }
            />
          )}
          <Button asChild variant="outline" size="sm">
            <Link to={quizUrl}>
              <ArrowRight className="size-4" aria-hidden="true" />
              Teste dein Wissen im Quiz
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Link zur Wahl kopieren"
            title="Link zur Wahl kopieren"
            onClick={() =>
              void copyToClipboard(
                toAbsoluteUrl(`/wahlen/${territory}/${electionNum}/`),
              )
            }
          >
            <LinkIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {election != null && (
        <p className="mb-6 text-sm text-muted-foreground">
          Hier wird gezeigt, welcher Stimmanteil an Parteien ging, die sich im
          Wahl-o-Mat für die jeweiligen Thesen ausgesprochen haben.
          {sourceName && ` Quelle der Wahlergebnisse: ${sourceName}.`}
        </p>
      )}

      {error != null && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Die Wahl konnte nicht geladen werden."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <p className="py-12 text-center text-muted-foreground">Lädt…</p>
      )}

      {!isLoading && election != null && (
        <>
          <Legend
            text="Legende:"
            showMissing={legendShowMissing}
            className="mb-6"
          />
          <div className="space-y-6">
            {sortedTheses.map((t) => (
              <ThesisCard
                key={`thesis-${t.id}`}
                thesis={t}
                election={election}
              />
            ))}
          </div>

          <section
            id="methodik"
            className="mt-12 rounded-lg border border-border bg-muted/40 p-5 text-sm text-muted-foreground"
          >
            <p>
              Die Thesen und Parteipositionen stammen aus dem{" "}
              <a
                href={election.source}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Wahl-o-Mat zur {election.title}
              </a>{" "}
              der Bundeszentrale für politische Bildung. Sie wurden mit
              Wahlergebnissen
              {election.results_source != null && (
                <>
                  {" "}
                  (
                  <a
                    href={election.results_source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {election.results_source.name}
                  </a>
                  )
                </>
              )}{" "}
              kombiniert, um zu zeigen, welche politischen Positionen von einer
              Mehrzahl der Wähler durch ihre Stimme unterstützt werden.
            </p>
          </section>

          {suggestions.length > 0 && (
            <SuggestionsGrid title="Und jetzt:" sections={suggestions} />
          )}
        </>
      )}
    </div>
  );
}
