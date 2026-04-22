import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { WikidataLabel } from "@/components/DataLabel";
import Legend from "@/components/Legend";
import SourcesFooter from "@/components/SourcesFooter";
import SEO from "@/components/SEO";
import SuggestionsGrid, {
  type SuggestionSection,
} from "@/components/SuggestionsGrid";
import ThesisCompact from "@/components/ThesisCompact";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import useBase from "@/hooks/useBase";
import useElection from "@/hooks/useElection";
import { yearOf } from "@/lib/dates";
import type {
  ElectionSummary,
  Thesis as ThesisData,
  ThesisPosition,
} from "@/types/api";

import "./Election.css";

type SubheaderProps = {
  iframe: boolean;
  preliminary?: boolean;
  sourceName?: string;
  numTheses: number;
};

function ElectionSubheader({
  iframe,
  preliminary,
  sourceName,
  numTheses,
}: SubheaderProps) {
  const n = numTheses === 0 ? "..." : numTheses;
  if (iframe) {
    const rv = preliminary
      ? `Für den Wahl-O-Mat wurden alle Parteien gefragt, wie sie zu ${n} Kernfragen stehen. So kann man schon jetzt sehen, welche Positionen wahrscheinlich gewählt werden.`
      : `Für den Wahl-O-Mat wurden alle Parteien gefragt, wie sie zu ${n} Kernfragen stehen. So kann man jetzt sehen, welche Positionen wirklich gewählt wurden.`;
    return (
      <span>
        {rv}{" "}
        <em>
          <a href="#methodik">Mehr zur Methode.</a>
        </em>
      </span>
    );
  }
  return (
    <>
      {preliminary
        ? `Hier wird gezeigt, welcher Stimmanteil laut ${sourceName ?? "Umfragen"} an Parteien gehen wird, die sich im Wahl-o-Mat für die jeweiligen Thesen ausgesprochen haben`
        : "Hier wird gezeigt, welcher Stimmanteil an Parteien ging, die sich im Wahl-o-Mat für die jeweiligen Thesen ausgesprochen haben."}
    </>
  );
}

function ratioOf(
  election: ElectionSummary,
  positions: ThesisPosition[],
): number {
  const res = election.results;
  const targetPositions = positions.filter((p) => p.value === 1);
  return targetPositions.reduce((acc, cur) => {
    if (res[cur.party] == null) {
      const multi = Object.keys(res).filter(
        (k) => res[k]!.linked_position === cur.party,
      );
      return acc + multi.reduce((a, k) => a + res[k]!.pct, 0);
    }
    return acc + res[cur.party]!.pct;
  }, 0);
}

function mainTitle(election: ElectionSummary): string {
  if (election.preliminary) {
    return `Welche Politik wird bei der ${election.title} voraussichtlich gewählt?`;
  }
  const label =
    election.title === "Landtagswahl Hessen 2018"
      ? "Hessenwahl"
      : election.title;
  return `Welche Politik wurde bei der ${label} gewählt?`;
}

export default function Election() {
  const params = useParams();
  const territory = (params.territory ?? "deutschland") as TerritorySlug;
  const electionNum = Number.parseInt(params.electionNum ?? "0", 10);

  const elQuery = useElection(electionNum);
  const base = useBase();

  const election = elQuery.data?.data;
  const theses: ThesisData[] = useMemo(
    () => elQuery.data?.theses ?? [],
    [elQuery.data],
  );
  const isLoading = elQuery.isLoading;

  const sortedTheses = useMemo(() => {
    if (election == null) return theses;
    return theses
      .slice()
      .sort((a, b) =>
        ratioOf(election, a.positions) > ratioOf(election, b.positions)
          ? -1
          : 1,
      );
  }, [election, theses]);

  const suggestions: SuggestionSection[] = useMemo(() => {
    if (election == null) return [];
    const territoryElections = base.data?.data.elections[territory];
    const other = territoryElections
      ?.slice()
      .reverse()
      .find((e) => e.id !== electionNum);
    const occ2 = other ?? election;
    return [
      {
        subTitle: "Teste dein Wissen",
        title: `Quiz zur ${election.title}`,
        href: `/quiz/${territory}/${electionNum}/`,
      },
      {
        subTitle: "Welche Politik wurde gewählt",
        title: occ2.title,
        href: `/wahlen/${territory}/${occ2.id}/`,
      },
      {
        subTitle: "Alle Wahlen in",
        title: TERRITORY_NAMES[territory] ?? territory,
        href: `/wahlen/${territory}/`,
      },
      {
        subTitle: "Stöbere in",
        title: "600+ Wahlkampfthemen",
        href: "/themen/",
      },
    ];
  }, [election, base.data, territory, electionNum]);

  const pageTitle = election ? `Metawahl: ${election.title}` : "Metawahl";
  const quizUrl = election
    ? `/quiz/${election.territory}/${election.id}/`
    : "";
  const sourceName =
    typeof election?.results_source?.name === "string"
      ? election.results_source.name
      : undefined;
  const legendShowMissing = election
    ? yearOf(election.date) < 2008
    : false;

  return (
    <div className="ui container electionContainer">
      <SEO title={pageTitle} />

      <div className="ui breadcrumb">
        <a className="section" href="/wahlen/">Wahlen</a>
        <i className="right angle icon divider" />
        <a className="section" href={`/wahlen/${territory}/`}>
          {TERRITORY_NAMES[territory] ?? territory}
        </a>
        <i className="right angle icon divider" />
        {election == null ? (
          <span className="section">Loading...</span>
        ) : (
          <a
            className="active section"
            href={`/wahlen/${territory}/${electionNum}/`}
          >
            {yearOf(election.date)}
          </a>
        )}
      </div>

      {election && <WikidataLabel wikidata_id={election.wikidata_id} />}

      {election && (
        <a
          className="ui compact right floated button"
          href={quizUrl}
          style={{ marginBottom: "1rem", marginTop: "1rem" }}
        >
          <i className="right arrow icon" />
          Teste dein Wissen im Quiz
        </a>
      )}

      <div className="election-component">
        <h1 className="ui header">
          {election ? mainTitle(election) : " "}
          {election && (
            <div className="sub header">
              <ElectionSubheader
                iframe={false}
                preliminary={election.preliminary}
                sourceName={sourceName}
                numTheses={theses.length}
              />
            </div>
          )}
        </h1>

        {election && (
          <Legend
            text="Legende:"
            showMissing={legendShowMissing}
            preliminary={election.preliminary ?? false}
          />
        )}

        {election && sortedTheses.length > 0 && (
          <span>
            <div className="theses">
              {sortedTheses.map((t, i) => (
                <div key={`thesis-compact-${i}`} className="thesis-compact">
                  <h2 className="ui header medium">{t.title}</h2>
                  <ThesisCompact
                    election={election}
                    listIndex={i}
                    {...t}
                  />
                </div>
              ))}
            </div>
            <SourcesFooter election={election} />
          </span>
        )}
      </div>

      {isLoading && <div className="ui active centered inline loader" />}

      {!isLoading && suggestions.length > 0 && (
        <SuggestionsGrid title="Und jetzt:" sections={suggestions} />
      )}
    </div>
  );
}
