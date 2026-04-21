import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  mergePartyData,
  PositionChart,
  type PartyPositionDatum,
} from "@/components/PositionChart";
import { TagBadge } from "@/components/TagBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COLOR_PALETTE, OPINION_COLORS } from "@/config";
import { cn } from "@/lib/utils";
import type { Election, Position, QuizAnswer, Thesis as ThesisModel } from "@/types/api";
import { extractThesisId } from "@/lib/thesis";

type QuizProps = {
  quizMode?: boolean;
  onAnswer?: (answer: QuizAnswer, correctAnswer: Position) => void;
  answered?: boolean;
};

type ThesisProps = {
  thesis: ThesisModel;
  election?: Election;
  linkElection?: boolean;
  hideTags?: boolean;
  /** When true, show a hover-hint below the chart. */
  showHints?: boolean;
  showChart?: boolean;
  className?: string;
} & QuizProps;

type OpenText = {
  header: string;
  text: string;
};

const VALUE_NAMES: Record<string, string> = {
  "-1": "Dagegen",
  "0": "Neutral",
  "1": "Dafür",
};

function buildOpenText(
  datum: PartyPositionDatum,
  election: Election,
): OpenText {
  let text: string;
  if (datum.party === "Sonstige") {
    text =
      "Kleine Parteien sind in den Prognosewerten nicht enthalten, da deren Wahlergebnisse kaum vorherzusehen sind.";
  } else if (datum.value === "missing") {
    text =
      "Von dieser Partei liegen zu dieser Wahl keine Stellungnahmen vor.";
  } else if (datum.text == null || datum.text.length === 0) {
    text = "Es liegt keine Begründung zur Position dieser Partei vor.";
  } else {
    text = `»${datum.text}«`;
  }
  const row = election.results[datum.party];
  const name = datum.party;
  const result = row?.pct != null ? `${row.pct}%` : "<0,1%";
  const posName =
    datum.value !== "missing"
      ? `: ${VALUE_NAMES[String(datum.value)]}`
      : "";
  return { header: `${name} — ${result}${posName}`, text };
}

function computeVoterOpinion(
  parties: readonly PartyPositionDatum[],
): { voterOpinion: Position; ratioPro: number; ratioContra: number } {
  const ratioPro = parties
    .filter((p) => p.value === 1)
    .reduce((acc, p) => acc + (p.pct ?? 0), 0);
  const ratioContra = parties
    .filter((p) => p.value === -1)
    .reduce((acc, p) => acc + (p.pct ?? 0), 0);
  let voterOpinion: Position;
  if (ratioPro > 50) {
    voterOpinion = 1;
  } else if (ratioContra < 50) {
    voterOpinion = 0;
  } else {
    voterOpinion = -1;
  }
  return { voterOpinion, ratioPro, ratioContra };
}

/**
 * Thesis card used on election + tag views. Includes an inline
 * PositionChart underneath each thesis; switches into a quiz layout when
 * `quizMode` is set.
 */
export function Thesis({
  thesis,
  election,
  linkElection = false,
  hideTags = false,
  showHints = false,
  showChart = true,
  quizMode = false,
  onAnswer,
  answered = false,
  className,
}: ThesisProps) {
  const ids = extractThesisId(thesis.id);
  const permaLink =
    election != null && ids != null
      ? `/wahlen/${election.territory}/${ids.womId}/${ids.thesisNum}/`
      : null;

  const parties = useMemo<PartyPositionDatum[]>(() => {
    if (election == null) return [];
    return mergePartyData(thesis.positions, election.results);
  }, [thesis, election]);

  const { voterOpinion, ratioPro, ratioContra } = useMemo(
    () => computeVoterOpinion(parties),
    [parties],
  );

  const [openText, setOpenText] = useState<OpenText | null>(null);
  const [showSources, setShowSources] = useState(false);

  const sortedTags = useMemo(
    () => [...thesis.tags].sort((a, b) => (a.slug > b.slug ? 1 : -1)),
    [thesis.tags],
  );

  const voterOpinionColor =
    voterOpinion === 0
      ? COLOR_PALETTE[1]
      : voterOpinion === -1
        ? COLOR_PALETTE[0]
        : COLOR_PALETTE[2];

  const showChartBlock =
    showChart && election != null && parties.length > 0;

  const headerUnansweredInQuiz = quizMode && !answered;
  const useColoredHeader = headerUnansweredInQuiz || showChartBlock;

  const headerStyle = headerUnansweredInQuiz
    ? { backgroundColor: "#333", color: "#fcfcfc" }
    : useColoredHeader
      ? { backgroundColor: voterOpinionColor }
      : undefined;

  let subHeader = "";
  if (election != null) {
    if (voterOpinion === 0) {
      subHeader = " Keine Mehrheit dafür oder dagegen";
    } else if (voterOpinion === 1) {
      subHeader =
        Math.round(ratioPro).toString() +
        " von 100 haben Parteien gewählt, die dafür waren";
    } else {
      subHeader =
        Math.round(ratioContra).toString() +
        " von 100 haben Parteien gewählt, die dagegen waren";
    }
  }

  return (
    <Card
      className={cn("gap-0 overflow-hidden py-0", className)}
      data-slot="thesis-card"
    >
      <header
        className={cn(
          "px-6 py-5",
          useColoredHeader ? "text-white" : "",
          linkElection && "min-h-[4em]",
        )}
        style={headerStyle}
      >
        {linkElection && election != null && (
          <p
            className={cn(
              "mb-1 text-xs uppercase tracking-wide",
              useColoredHeader ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {election.title}
          </p>
        )}
        {permaLink != null && !quizMode ? (
          <Link to={permaLink} className="block">
            <h2 className="text-lg font-semibold leading-snug hover:underline md:text-xl">
              {thesis.text}
            </h2>
          </Link>
        ) : (
          <h2 className="text-lg font-semibold leading-snug md:text-xl">
            {thesis.text}
          </h2>
        )}
        {!headerUnansweredInQuiz && useColoredHeader && election != null && (
          <p className="mt-2 text-sm text-white/90">{subHeader}</p>
        )}
      </header>

      {!headerUnansweredInQuiz && showChartBlock && (
        <div className="px-6 py-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Stimmverteilung
          </h3>
          <PositionChart
            parties={parties}
            preliminary={false}
            onSelect={(d) => {
              if (election != null) setOpenText(buildOpenText(d, election));
            }}
          />
          {openText != null && (
            <div className="mt-3 rounded border border-border bg-muted p-3 text-sm">
              <div className="mb-1 font-semibold">{openText.header}</div>
              <div>{openText.text}</div>
            </div>
          )}
          {showHints && openText == null && (
            <p className="mt-3 text-sm text-muted-foreground">
              Bewege deine Maus über die Parteinamen, um deren Position zu
              dieser These zu lesen.
            </p>
          )}
          <div className="mt-3 text-xs text-muted-foreground">
            <button
              type="button"
              className="cursor-pointer underline"
              onClick={() => setShowSources((s) => !s)}
            >
              Quellen
            </button>
            {showSources && election != null && (
              <span className="ml-1 normal-case">
                :{" "}
                <a href={election.source} className="underline">
                  Wahl-o-Mat zur {election.title}
                </a>
                {election.results_source != null && (
                  <>
                    ,{" "}
                    <a
                      href={election.results_source.url}
                      className="underline"
                    >
                      {election.results_source.name}
                    </a>
                  </>
                )}
              </span>
            )}
          </div>
        </div>
      )}

      {!hideTags && !headerUnansweredInQuiz && sortedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border bg-muted/50 px-6 py-4">
          {sortedTags.map((tag) => (
            <TagBadge key={`thesis-${thesis.id}-tag-${tag.slug}`} tag={tag} />
          ))}
        </div>
      )}

      {quizMode && !answered && onAnswer != null && (
        <div
          className="quizButtons grid grid-cols-1 gap-2 border-t border-border bg-card p-4 sm:grid-cols-2"
          role="group"
          aria-label="Antwortmöglichkeiten"
        >
          <Button
            type="button"
            onClick={() => onAnswer(1, voterOpinion)}
            className="h-12 text-white hover:opacity-90"
            style={{ backgroundColor: OPINION_COLORS[1] }}
          >
            Mehrheit stimmt dafür
          </Button>
          <Button
            type="button"
            onClick={() => onAnswer(-1, voterOpinion)}
            className="h-12 text-white hover:opacity-90"
            style={{ backgroundColor: OPINION_COLORS["-1"] }}
          >
            Mehrheit stimmt dagegen
          </Button>
        </div>
      )}
    </Card>
  );
}

export default Thesis;
